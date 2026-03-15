const pool = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT album_title AS album_name, artist, streams_albums AS streams, release_year_albums AS release_year, genre 
      FROM most_streamed_albums
      ORDER BY streams DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching albums:', err.message);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
};

const getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM most_streamed_albums');
    res.json({ total });
  } catch (err) {
    console.error('Error fetching album stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch album stats' });
  }
};

module.exports = { getAll, getStats };
