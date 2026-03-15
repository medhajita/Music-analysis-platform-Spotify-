const pool = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        dac.country, 
        dac.artist AS artist_name, 
        a.total_streams AS streams, 
        dac.listeners, 
        a.genre
      FROM different_artists_per_country dac
      LEFT JOIN artists a ON dac.artist = a.artist
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching countries:', err.message);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

const getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM different_artists_per_country');
    res.json({ total });
  } catch (err) {
    console.error('Error fetching country stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch country stats' });
  }
};

module.exports = { getAll, getStats };
