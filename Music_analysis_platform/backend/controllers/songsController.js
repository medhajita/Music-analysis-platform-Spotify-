const pool = require('../config/db');

// @desc    Get most streamed songs with filtering
// @route   GET /api/songs/most-streamed
const getMostStreamedSongs = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, genre, country, search } = req.query;
    
    let query = 'SELECT * FROM most_streamed_songs WHERE 1=1';
    const params = [];

    if (genre) { query += ' AND genre = ?'; params.push(genre); }
    if (country) { query += ' AND country = ?'; params.push(country); }
    if (search) { query += ' AND (song_title LIKE ? OR artist LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY streams_songs DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    // Total count
    let countQuery = 'SELECT COUNT(*) as count FROM most_streamed_songs WHERE 1=1';
    const countParams = [];
    if (genre) { countQuery += ' AND genre = ?'; countParams.push(genre); }
    if (country) { countQuery += ' AND country = ?'; countParams.push(country); }
    if (search) { countQuery += ' AND (song_title LIKE ? OR artist LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    
    const [countRows] = await pool.query(countQuery, countParams);

    res.status(200).json({
      data: rows,
      total: countRows[0].count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get worldwide aggregated songs
// @route   GET /api/songs/worldwide
const getWorldwideSongs = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let query = `
      SELECT 
        song_title, 
        artist, 
        SUM(total_streams_song_per_country) as total_global, 
        COUNT(DISTINCT streamed_country) as countries_count, 
        genre
      FROM different_streamed_songs_around_the_world 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (song_title LIKE ? OR artist LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += `
      GROUP BY song_title, artist, genre
      ORDER BY total_global DESC 
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get songs by country code
// @route   GET /api/songs/by-country
const getSongsByCountry = async (req, res, next) => {
  try {
    const { country_code = 'US', limit = 50 } = req.query;
    const [rows] = await pool.query(
      'SELECT * FROM different_streamed_songs_around_the_world WHERE streamed_country_code = ? ORDER BY total_streams_song_per_country DESC LIMIT ?',
      [country_code, parseInt(limit)]
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get coverage for a specific song (which countries it is in)
const getSongCoverage = async (req, res, next) => {
  try {
    const { title, artist } = req.query;
    const [rows] = await pool.query(
      'SELECT streamed_country, streamed_country_code, total_streams_song_per_country FROM different_streamed_songs_around_the_world WHERE song_title = ? AND artist = ?',
      [title, artist]
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Top countries by aggregated song streams
// @route   GET /api/songs/top-countries-streams
const getTopCountriesSongStreams = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const [rows] = await pool.query(
      `SELECT
         streamed_country as country,
         streamed_country_code as country_code,
         SUM(total_streams_song_per_country) as total_streams
       FROM different_streamed_songs_around_the_world
       WHERE streamed_country IS NOT NULL AND streamed_country != ''
       GROUP BY streamed_country, streamed_country_code
       ORDER BY total_streams DESC
       LIMIT ?`,
      [limit]
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Monthly release trend (fallback by release year when month is unavailable)
// @route   GET /api/songs/release-trend
const getMonthlyReleaseTrend = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(
           STR_TO_DATE(CONCAT(CAST(release_year_songs AS CHAR), '-01-01'), '%Y-%m-%d'),
           '%Y-%m'
         ) as release_period,
         COUNT(*) as songs_released
       FROM most_streamed_songs
       WHERE release_year_songs IS NOT NULL
       GROUP BY release_year_songs
       ORDER BY release_year_songs ASC`
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Streams distribution by genre
// @route   GET /api/songs/genre-distribution
const getGenreStreamsDistribution = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         genre,
         SUM(streams_songs) as total_streams,
         COUNT(*) as songs_count
       FROM most_streamed_songs
       WHERE genre IS NOT NULL AND genre != ''
       GROUP BY genre
       ORDER BY total_streams DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Top artists by total song streams
// @route   GET /api/songs/top-artists-streams
const getTopArtistsBySongStreams = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const { country_code } = req.query;
    const params = [];
    let query = `
      SELECT
        artist,
        SUM(streams_songs) as total_streams,
        COUNT(*) as songs_count
      FROM most_streamed_songs
      WHERE artist IS NOT NULL AND artist != ''
    `;

    if (country_code) {
      query += ' AND country_code = ?';
      params.push(country_code);
    }

    query += `
      GROUP BY artist
      ORDER BY total_streams DESC
      LIMIT ?
    `;
    params.push(limit);

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Songs count by genre
// @route   GET /api/songs/genre-song-count
const getGenreSongCount = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const { country_code } = req.query;
    const params = [];
    let query = `
      SELECT
        genre,
        COUNT(*) as songs_count,
        SUM(streams_songs) as total_streams
      FROM most_streamed_songs
      WHERE genre IS NOT NULL AND genre != ''
    `;

    if (country_code) {
      query += ' AND country_code = ?';
      params.push(country_code);
    }

    query += `
      GROUP BY genre
      ORDER BY songs_count DESC, total_streams DESC
      LIMIT ?
    `;
    params.push(limit);

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// Legacy stubs
const getSongs = getMostStreamedSongs;
const getSongById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM most_streamed_songs WHERE id = ?', [req.params.id]);
    res.status(200).json(rows[0]);
  } catch (error) { next(error); }
};

module.exports = {
  getSongs,
  getSongById,
  getMostStreamedSongs,
  getWorldwideSongs,
  getSongsByCountry,
  getSongCoverage,
  getTopCountriesSongStreams,
  getMonthlyReleaseTrend,
  getGenreStreamsDistribution,
  getTopArtistsBySongStreams,
  getGenreSongCount
};
