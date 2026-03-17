const pool = require('../config/db');
const axios = require('axios');

const getLastFmArtistInfo = async (artistName, apiKey) => {
  if (!artistName || !apiKey) return null;

  try {
    const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json`;
    const response = await axios.get(lastFmUrl, { timeout: 7000 });
    const lfm = response?.data?.artist;
    if (!lfm) return null;

    return {
      artist: lfm.name,
      artist_image_url: lfm.image?.[3]?.['#text'] || lfm.image?.[2]?.['#text'] || null,
      bio: lfm.bio?.summary || '',
      listeners: Number(lfm.stats?.listeners || 0),
      playcount: Number(lfm.stats?.playcount || 0),
      genre: lfm.tags?.tag?.[0]?.name || 'N/A',
      url: lfm.url || null
    };
  } catch (error) {
    // Silent fallback: search should still work with DB-only data if Last.fm fails.
    return null;
  }
};

const getLastFmTopTracks = async (artistName, apiKey, limit = 5) => {
  if (!artistName || !apiKey) return [];

  try {
    const topTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&limit=${limit}`;
    const response = await axios.get(topTracksUrl, { timeout: 7000 });
    const rawTracks = response?.data?.toptracks?.track;
    const tracks = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [];

    return tracks
      .map((track) => ({
        name: track?.name || null,
        playcount: Number(track?.playcount || 0),
        listeners: Number(track?.listeners || 0),
        url: track?.url || null
      }))
      .filter((track) => track.name)
      .slice(0, limit);
  } catch (error) {
    // Silent fallback: keep the search result even if top tracks cannot be fetched.
    return [];
  }
};

const getLastFmSimilarArtists = async (artistName, apiKey, limit = 10) => {
  if (!artistName || !apiKey) return [];

  try {
    const similarUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&limit=${limit}`;
    const response = await axios.get(similarUrl, { timeout: 7000 });
    const rawArtists = response?.data?.similarartists?.artist;
    const artists = Array.isArray(rawArtists) ? rawArtists : rawArtists ? [rawArtists] : [];

    return artists
      .map((artist) => ({
        artist: artist?.name || null,
        artist_image_url: artist?.image?.[3]?.['#text'] || artist?.image?.[2]?.['#text'] || null,
        lastfm_url: artist?.url || null,
        match: Number(artist?.match || 0)
      }))
      .filter((artist) => artist.artist)
      .slice(0, limit);
  } catch (error) {
    return [];
  }
};

// @desc    Get streamed countries map data for an artist
// @route   GET /api/search/artist-streamed-countries?artist=...
const getArtistStreamedCountries = async (req, res, next) => {
  const artistName = String(req.query.artist || '').trim();
  const requestedLimit = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 250;

  if (!artistName) {
    return res.status(400).json({ message: 'Query parameter "artist" is required' });
  }

  try {
    const baseSelect = `
      SELECT
        TRIM(streamed_country) AS country,
        NULLIF(UPPER(TRIM(streamed_country_code)), '') AS country_code,
        SUM(COALESCE(total_streams_song_per_country, 0)) AS streams,
        COUNT(DISTINCT song_title) AS songs_count
      FROM different_streamed_songs_around_the_world
      WHERE streamed_country IS NOT NULL
        AND TRIM(streamed_country) != ''
        AND artist IS NOT NULL
        AND TRIM(artist) != ''
    `;

    const groupOrder = `
      GROUP BY TRIM(streamed_country), NULLIF(UPPER(TRIM(streamed_country_code)), '')
      ORDER BY streams DESC
      LIMIT ?
    `;

    const exactQuery = `
      ${baseSelect}
        AND LOWER(TRIM(artist)) = LOWER(TRIM(?))
      ${groupOrder}
    `;
    const [exactRows] = await pool.query(exactQuery, [artistName, limit]);

    if (exactRows.length > 0) {
      return res.status(200).json({
        artist: artistName,
        match_type: 'exact',
        data: exactRows
      });
    }

    const fallbackQuery = `
      ${baseSelect}
        AND LOWER(TRIM(artist)) LIKE CONCAT('%', LOWER(TRIM(?)), '%')
      ${groupOrder}
    `;
    const [fallbackRows] = await pool.query(fallbackQuery, [artistName, limit]);

    return res.status(200).json({
      artist: artistName,
      match_type: fallbackRows.length > 0 ? 'partial' : 'none',
      data: fallbackRows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search for an artist (DB first, then Last.fm fallback)
// @route   GET /api/search/artist?q=...
const searchArtist = async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Query parameter "q" is required' });
  }

  try {
    const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
    const rankedArtistsCte = `
      WITH RankedArtists AS (
        SELECT *, RANK() OVER (ORDER BY total_streams DESC) as global_rank
        FROM artists
      )
    `;

    // 1. Search in local database with ranking
    const dbQuery = `
      ${rankedArtistsCte}
      SELECT * FROM RankedArtists 
      WHERE artist LIKE ? 
      ORDER BY total_streams DESC 
      LIMIT 10
    `;
    const [dbResults] = await pool.query(dbQuery, [`%${q}%`]);

    if (dbResults.length > 0) {
      const primaryArtist = { ...dbResults[0] };
      let similarArtists = [];

      if (LASTFM_API_KEY && primaryArtist.artist) {
        const [lfmInfo, lfmTopTracks, lfmSimilarArtists] = await Promise.all([
          getLastFmArtistInfo(primaryArtist.artist, LASTFM_API_KEY),
          getLastFmTopTracks(primaryArtist.artist, LASTFM_API_KEY, 5),
          getLastFmSimilarArtists(primaryArtist.artist, LASTFM_API_KEY, 10)
        ]);

        if (lfmInfo) {
          if (!primaryArtist.artist_image_url && lfmInfo.artist_image_url) {
            primaryArtist.artist_image_url = lfmInfo.artist_image_url;
          }
          if (lfmInfo.bio) {
            primaryArtist.bio = lfmInfo.bio;
          }
          if (lfmInfo.url) {
            primaryArtist.lastfm_url = lfmInfo.url;
          }
        }
        primaryArtist.best_tracks = lfmTopTracks;
        similarArtists = lfmSimilarArtists;
      } else {
        primaryArtist.best_tracks = [];
      }

      return res.status(200).json({
        source: 'database',
        results: [primaryArtist, ...dbResults.slice(1)],
        similar_artists: similarArtists
      });
    }

    // 2. Fallback to Last.fm if no local results
    if (!LASTFM_API_KEY) {
      return res.status(200).json({
        source: 'none',
        message: 'No results found and Last.fm API key is missing',
        results: []
      });
    }

    const mappedResult = await getLastFmArtistInfo(q, LASTFM_API_KEY);
    if (mappedResult) {
      const [lfmTopTracks, lfmSimilarArtists] = await Promise.all([
        getLastFmTopTracks(mappedResult.artist || q, LASTFM_API_KEY, 5),
        getLastFmSimilarArtists(mappedResult.artist || q, LASTFM_API_KEY, 10)
      ]);
      mappedResult.best_tracks = lfmTopTracks;

      return res.status(200).json({
        source: 'lastfm',
        results: [mappedResult],
        similar_artists: lfmSimilarArtists
      });
    }

    res.status(200).json({
      source: 'none',
      message: 'No results found',
      results: [],
      similar_artists: []
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchArtist,
  getArtistStreamedCountries
};
