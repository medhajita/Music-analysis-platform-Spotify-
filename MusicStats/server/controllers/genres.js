const pool = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const [artistRows, songRows, albumRows] = await Promise.all([
      pool.query(`
        SELECT genre, COUNT(*) AS artistCount, SUM(total_streams) AS totalStreams, SUM(listeners) AS totalListeners
        FROM artists WHERE genre IS NOT NULL AND genre != '' GROUP BY genre
      `),
      pool.query(`
        SELECT genre, COUNT(*) AS songCount
        FROM most_streamed_songs WHERE genre IS NOT NULL AND genre != '' GROUP BY genre
      `),
      pool.query(`
        SELECT genre, COUNT(*) AS albumCount
        FROM most_streamed_albums WHERE genre IS NOT NULL AND genre != '' GROUP BY genre
      `)
    ]);

    // Merge into a single map keyed by genre
    const genreMap = {};

    artistRows[0].forEach(r => {
      genreMap[r.genre] = {
        genre: r.genre,
        artistCount: r.artistCount || 0,
        totalStreams: Number(r.totalStreams) || 0,
        totalListeners: Number(r.totalListeners) || 0,
        songCount: 0,
        albumCount: 0
      };
    });

    songRows[0].forEach(r => {
      if (!genreMap[r.genre]) {
        genreMap[r.genre] = { genre: r.genre, artistCount: 0, totalStreams: 0, totalListeners: 0, songCount: 0, albumCount: 0 };
      }
      genreMap[r.genre].songCount = r.songCount || 0;
    });

    albumRows[0].forEach(r => {
      if (!genreMap[r.genre]) {
        genreMap[r.genre] = { genre: r.genre, artistCount: 0, totalStreams: 0, totalListeners: 0, songCount: 0, albumCount: 0 };
      }
      genreMap[r.genre].albumCount = r.albumCount || 0;
    });

    const result = Object.values(genreMap).sort((a, b) => b.totalStreams - a.totalStreams);
    res.json(result);
  } catch (err) {
    console.error('Error fetching genres:', err.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

const getYearlyTrend = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT genre, release_year_songs AS year, COUNT(*) AS count
      FROM most_streamed_songs
      WHERE genre IS NOT NULL AND genre != '' AND release_year_songs IS NOT NULL
      GROUP BY genre, release_year_songs
      ORDER BY year
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching genre yearly trend:', err.message);
    res.status(500).json({ error: 'Failed to fetch genre yearly trend' });
  }
};

module.exports = { getAll, getYearlyTrend };

