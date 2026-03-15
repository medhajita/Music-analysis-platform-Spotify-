const pool = require('../db/connection');

const searchByName = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query "q" is required' });
    }
    const [rows] = await pool.query(
      `SELECT artist, total_streams AS streams, listeners, followers, genre, country, tracks
       FROM artists WHERE artist LIKE ? ORDER BY listeners DESC LIMIT 10`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error searching artists:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
};

const getArtistDetail = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'Artist name is required' });
    }
    const [rows] = await pool.query(
      `SELECT artist, total_streams AS streams, solo_streams, feat_streams,
              listeners, followers, genre, country, tracks,
              streams_1B, streams_100M, streams_10M, streams_1M,
              peak_listeners, daily_gain_followers, weekly_gain_followers
       FROM artists WHERE artist = ? LIMIT 1`,
      [name]
    );
    if (rows.length === 0) {
      return res.json(null);
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching artist detail:', err.message);
    res.status(500).json({ error: 'Failed to fetch artist detail' });
  }
};

const getLastFmInfo = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'Artist name is required' });
    }

    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Last.fm API key not configured' });
    }

    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${apiKey}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.json(null);
    }

    const artist = data.artist;
    res.json({
      name: artist.name,
      image: artist.image?.[artist.image.length - 1]?.['#text'] || '',
      bio: artist.bio?.summary || '',
      tags: artist.tags?.tag?.map(t => t.name) || [],
      similar: artist.similar?.artist?.map(a => ({
        name: a.name,
        image: a.image?.[a.image.length - 1]?.['#text'] || ''
      })) || [],
      stats: {
        listeners: Number(artist.stats?.listeners) || 0,
        playcount: Number(artist.stats?.playcount) || 0
      },
      url: artist.url || ''
    });
  } catch (err) {
    console.error('Error fetching Last.fm info:', err.message);
    res.status(500).json({ error: 'Failed to fetch Last.fm info' });
  }
};

module.exports = { searchByName, getArtistDetail, getLastFmInfo };
