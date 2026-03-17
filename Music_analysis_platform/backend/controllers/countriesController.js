const pool = require('../config/db');

// @desc    Get comprehensive country statistics
// @route   GET /api/countries
const getCountries = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        base.country, 
        MAX(base.country_code) as country_code,
        SUM(COALESCE(art.artists_count, 0)) as artists_count,
        SUM(COALESCE(art.total_artist_streams, 0)) as total_artist_streams,
        SUM(COALESCE(alb.albums_count, 0)) as albums_count,
        SUM(COALESCE(alb.total_album_streams, 0)) as total_album_streams,
        SUM(COALESCE(sng.songs_count, 0) + COALESCE(wld.songs_count, 0)) as total_songs_count
      FROM (
        SELECT country, NULL as country_code FROM artists WHERE country IS NOT NULL AND country != ''
        UNION
        SELECT country, country_code FROM most_streamed_albums WHERE country IS NOT NULL AND country != ''
        UNION
        SELECT country, country_code FROM most_streamed_songs WHERE country IS NOT NULL AND country != ''
        UNION
        SELECT streamed_country as country, streamed_country_code as country_code 
        FROM different_streamed_songs_around_the_world 
        WHERE streamed_country IS NOT NULL AND streamed_country != ''
      ) as base
      LEFT JOIN (
        SELECT country, COUNT(*) as artists_count, SUM(total_streams) as total_artist_streams 
        FROM artists GROUP BY country
      ) as art ON base.country = art.country
      LEFT JOIN (
        SELECT country, COUNT(*) as albums_count, SUM(streams_albums) as total_album_streams 
        FROM most_streamed_albums GROUP BY country
      ) as alb ON base.country = alb.country
      LEFT JOIN (
        SELECT country, COUNT(*) as songs_count 
        FROM most_streamed_songs GROUP BY country
      ) as sng ON base.country = sng.country
      LEFT JOIN (
        SELECT streamed_country as country, COUNT(DISTINCT song_id) as songs_count 
        FROM different_streamed_songs_around_the_world GROUP BY streamed_country
      ) as wld ON base.country = wld.country
      WHERE base.country IS NOT NULL
      GROUP BY base.country
      ORDER BY total_artist_streams DESC
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top artists, albums, and songs for a country
// @route   GET /api/countries/:code/details?name=France
const getCountryDetails = async (req, res, next) => {
  const { code } = req.params;
  const { name } = req.query;
  
  try {
    // Artists table doesn't have country_code, using country name
    const [artists] = await pool.query(
      'SELECT artist, total_streams, artist_image_url FROM artists WHERE country = ? ORDER BY total_streams DESC LIMIT 5',
      [name]
    );

    const [albums] = await pool.query(
      'SELECT album_title, streams_albums, album_image_url, artist FROM most_streamed_albums WHERE country_code = ? ORDER BY streams_albums DESC LIMIT 5',
      [code]
    );

    const [songs] = await pool.query(
      `SELECT song_title as title, streams_songs as streams, song_image_url as image, artist FROM most_streamed_songs WHERE country_code = ?
       UNION ALL
       SELECT song_title as title, total_streams_song_per_country as streams, NULL as image, artist FROM different_streamed_songs_around_the_world WHERE streamed_country_code = ?
       ORDER BY streams DESC LIMIT 5`,
      [code, code]
    );

    res.status(200).json({ artists, albums, songs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCountries,
  getCountryDetails
};
