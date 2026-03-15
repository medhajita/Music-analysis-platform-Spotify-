const pool = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT artist, listeners, total_streams AS streams, followers, tracks AS titles_count
      FROM artists
      ORDER BY listeners DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching artists:', err.message);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
};

const getTopByListeners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT artist_name, listeners FROM artists ORDER BY listeners DESC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top artists:', err.message);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
};

const getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM artists');
    const [[{ totalListeners }]] = await pool.query('SELECT SUM(listeners) AS totalListeners FROM artists');
    const [[{ totalStreams }]] = await pool.query('SELECT SUM(streams) AS totalStreams FROM artists');
    res.json({ total, totalListeners, totalStreams });
  } catch (err) {
    console.error('Error fetching artist stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch artist stats' });
  }
};

module.exports = { getAll, getTopByListeners, getStats };
