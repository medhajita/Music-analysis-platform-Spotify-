const pool = require('../db/connection');

const getOverview = async (req, res) => {
  try {
    const [
      [[{ totalArtists }]],
      [[{ totalSongs }]],
      [[{ totalAlbums }]],
      [[{ totalGenres }]],
      [[{ totalCountries }]],
      [[{ totalStreams }]],
      [[{ totalFollowers }]],
      [[{ totalListeners }]],
      [topArtists],
      [genreDist],
      [topCountriesData],
      [scatterData],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS totalArtists FROM artists'),
      pool.query('SELECT COUNT(*) AS totalSongs FROM most_streamed_songs'),
      pool.query('SELECT COUNT(*) AS totalAlbums FROM most_streamed_albums'),
      pool.query(`SELECT COUNT(DISTINCT genre) AS totalGenres FROM artists WHERE genre IS NOT NULL AND genre != ''`),
      pool.query('SELECT COUNT(DISTINCT country) AS totalCountries FROM different_artists_per_country'),
      pool.query('SELECT SUM(total_streams) AS totalStreams FROM artists'),
      pool.query('SELECT SUM(followers) AS totalFollowers FROM artists'),
      pool.query('SELECT SUM(listeners) AS totalListeners FROM artists'),
      // Chart 1: Top 10 Most Streamed Artists
      pool.query('SELECT artist AS artist_name, total_streams AS streams FROM artists ORDER BY total_streams DESC LIMIT 10'),
      // Chart 2: Streams Distribution by Genre
      pool.query(`
        SELECT a.genre AS name, SUM(m.streams_songs) AS value 
        FROM artists a 
        JOIN most_streamed_songs m ON a.genre = m.genre 
        WHERE a.genre IS NOT NULL AND a.genre != '' AND a.genre != '[]'
        GROUP BY a.genre 
        ORDER BY value DESC 
        LIMIT 10
      `),
      // Chart 3: Top Countries by Artist Count
      pool.query('SELECT country, COUNT(*) as artist_count FROM different_artists_per_country GROUP BY country ORDER BY artist_count DESC LIMIT 10'),
      // Chart 4: Followers vs Listeners Scatter
      pool.query('SELECT artist AS artist_name, followers, listeners FROM artists ORDER BY followers DESC LIMIT 50'),
    ]);

    res.json({
      metrics: {
        totalArtists,
        totalSongs,
        totalAlbums,
        totalGenres,
        totalCountries,
        totalStreams,
        totalFollowers,
        totalListeners,
      },
      charts: {
        topArtistsByStreams: topArtists,
        genreDistribution: genreDist,
        topCountries: topCountriesData,
        followersVsListeners: scatterData,
      }
    });

  } catch (err) {
    console.error('Error fetching stats overview:', err.message);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
};

module.exports = { getOverview };
