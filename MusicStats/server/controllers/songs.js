const pool = require('../db/connection');

const getTopSongs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT song_title AS song_name, artist AS artist_name, streams_songs AS streams, release_year_songs AS release_date, genre 
      FROM most_streamed_songs
      ORDER BY streams_songs DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top songs:', err.message);
    res.status(500).json({ error: 'Failed to fetch top songs' });
  }
};

const getWorldSongs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT song_title AS song_name, artist AS artist_name, streamed_country AS country, total_streams_song_per_country AS streams 
      FROM different_streamed_songs_around_the_world
      ORDER BY streams DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching world songs:', err.message);
    res.status(500).json({ error: 'Failed to fetch world songs' });
  }
};

module.exports = { getTopSongs, getWorldSongs };
