const pool = require('../config/db');

// @desc    Get global statistics for dashboard
// @route   GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const queries = {
      total_artists: 'SELECT COUNT(*) as count FROM artists',
      total_albums: 'SELECT COUNT(*) as count FROM most_streamed_albums',
      total_songs: `
        SELECT (
          (SELECT COUNT(*) FROM most_streamed_songs) + 
          (SELECT COUNT(DISTINCT song_id) FROM different_streamed_songs_around_the_world)
        ) as count`,
      total_streams: 'SELECT SUM(total_streams) as sum FROM artists',
      total_countries: 'SELECT COUNT(DISTINCT country) as count FROM artists WHERE country IS NOT NULL AND country != ""',
      total_genres: 'SELECT COUNT(DISTINCT genre) as count FROM artists WHERE genre IS NOT NULL AND genre != ""',
      top_artist_streams: 'SELECT artist, total_streams FROM artists ORDER BY total_streams DESC LIMIT 1',
      top_album_streams: 'SELECT album_title, streams_albums FROM most_streamed_albums ORDER BY streams_albums DESC LIMIT 1',
      avg_followers: 'SELECT AVG(followers) as avg FROM artists',
      artists_with_1B: 'SELECT COUNT(*) as count FROM artists WHERE streams_1B > 0',
      // Data for charts
      top_10_artists: 'SELECT artist, total_streams FROM artists ORDER BY total_streams DESC LIMIT 10',
      genre_distribution: 'SELECT genre, COUNT(*) as count FROM artists WHERE genre IS NOT NULL AND genre != "" GROUP BY genre ORDER BY count DESC LIMIT 8',
      country_distribution: 'SELECT country, COUNT(*) as count FROM artists WHERE country IS NOT NULL AND country != "" GROUP BY country',
      followers_distribution: 'SELECT followers FROM artists WHERE followers > 0'
    };

    const results = {};
    const queryPromises = Object.keys(queries).map(async (key) => {
      const [rows] = await pool.query(queries[key]);
      results[key] = rows;
    });

    await Promise.all(queryPromises);

    // Format the response for easier frontend consumption
    const stats = {
      kpis: {
        total_artists: results.total_artists[0].count,
        total_albums: results.total_albums[0].count,
        total_songs: results.total_songs[0].count,
        total_streams: results.total_streams[0].sum,
        total_countries: results.total_countries[0].count,
        total_genres: results.total_genres[0].count,
        top_artist: results.top_artist_streams[0],
        top_album: results.top_album_streams[0],
        avg_followers: Math.round(results.avg_followers[0].avg),
        artists_with_1B: results.artists_with_1B[0].count,
      },
      charts: {
        top_artists: results.top_10_artists,
        genres: results.genre_distribution,
        countries: results.country_distribution,
        followers: results.followers_distribution.map(r => r.followers)
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
