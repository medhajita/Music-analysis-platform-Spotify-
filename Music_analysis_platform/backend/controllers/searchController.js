const pool = require('../config/db');
const axios = require('axios');

// @desc    Search for an artist (DB first, then Last.fm fallback)
// @route   GET /api/search/artist?q=...
const searchArtist = async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Query parameter "q" is required' });
  }

  try {
    // 1. Search in local database with ranking
    const dbQuery = `
      WITH RankedArtists AS (
        SELECT *, RANK() OVER (ORDER BY total_streams DESC) as global_rank
        FROM artists
      )
      SELECT * FROM RankedArtists 
      WHERE artist LIKE ? 
      ORDER BY total_streams DESC 
      LIMIT 10
    `;
    const [dbResults] = await pool.query(dbQuery, [`%${q}%`]);

    if (dbResults.length > 0) {
      return res.status(200).json({
        source: 'database',
        results: dbResults
      });
    }

    // 2. Fallback to Last.fm if no local results
    const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
    
    if (!LASTFM_API_KEY) {
      return res.status(200).json({
        source: 'none',
        message: 'No results found and Last.fm API key is missing',
        results: []
      });
    }

    const lastFmUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(q)}&api_key=${LASTFM_API_KEY}&format=json`;
    const response = await axios.get(lastFmUrl);

    if (response.data.artist) {
      const lfm = response.data.artist;
      // Map Last.fm response to our internal format
      const mappedResult = {
        artist: lfm.name,
        artist_image_url: lfm.image?.[3]?.['#text'] || lfm.image?.[2]?.['#text'] || null,
        bio: lfm.bio?.summary || '',
        listeners: lfm.stats?.listeners || 0,
        playcount: lfm.stats?.playcount || 0,
        genre: lfm.tags?.tag?.[0]?.name || 'N/A',
        url: lfm.url
      };

      return res.status(200).json({
        source: 'lastfm',
        results: [mappedResult]
      });
    }

    res.status(200).json({
      source: 'none',
      message: 'No results found',
      results: []
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchArtist
};
