const pool = require('../config/db');

const COUNTRY_ALIASES = {
  US: ['US', 'USA', 'United States', 'United States of America'],
  CA: ['CA', 'CAN', 'Canada'],
  GB: ['GB', 'UK', 'United Kingdom', 'Great Britain']
};

const resolveCountryCandidates = (countryInput) => {
  const raw = String(countryInput || '').trim();
  if (!raw) return [];

  const upper = raw.toUpperCase();
  const entries = new Set([raw]);

  Object.values(COUNTRY_ALIASES).forEach((aliases) => {
    if (aliases.some((a) => a.toUpperCase() === upper)) {
      aliases.forEach((a) => entries.add(a));
    }
  });

  return [...entries];
};

// @desc    Get albums with filtering, sorting and pagination
// @route   GET /api/albums
const getAlbums = async (req, res, next) => {
  try {
    const { 
      sort = 'streams_albums', 
      order = 'DESC', 
      limit = 50, 
      offset = 0, 
      genre, 
      country,
      yearMin,
      yearMax,
      search 
    } = req.query;

    let query = 'SELECT * FROM most_streamed_albums WHERE 1=1';
    const params = [];

    if (genre) {
      query += ' AND genre = ?';
      params.push(genre);
    }

    if (country) {
      const countryCandidates = resolveCountryCandidates(country);
      const placeholders = countryCandidates.map(() => '?').join(', ');
      query += ` AND (UPPER(country) IN (${placeholders}) OR UPPER(country_code) IN (${placeholders}))`;
      params.push(
        ...countryCandidates.map((c) => c.toUpperCase()),
        ...countryCandidates.map((c) => c.toUpperCase())
      );
    }

    if (yearMin) {
      query += ' AND release_year_albums >= ?';
      params.push(parseInt(yearMin));
    }

    if (yearMax) {
      query += ' AND release_year_albums <= ?';
      params.push(parseInt(yearMax));
    }

    if (search) {
      query += ' AND (album_title LIKE ? OR artist LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Validate sort column
    const allowedSortColumns = ['album_title', 'artist', 'release_year_albums', 'streams_albums', 'weekly_gain_streams_albums', 'monthly_gain_streams_albums', 'genre', 'country', 'country_code'];
    const sortCol = allowedSortColumns.includes(sort) ? sort : 'streams_albums';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    // Total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM most_streamed_albums WHERE 1=1';
    const countParams = [];
    if (genre) { countQuery += ' AND genre = ?'; countParams.push(genre); }
    if (country) {
      const countryCandidates = resolveCountryCandidates(country);
      const placeholders = countryCandidates.map(() => '?').join(', ');
      countQuery += ` AND (UPPER(country) IN (${placeholders}) OR UPPER(country_code) IN (${placeholders}))`;
      countParams.push(
        ...countryCandidates.map((c) => c.toUpperCase()),
        ...countryCandidates.map((c) => c.toUpperCase())
      );
    }
    if (yearMin) { countQuery += ' AND release_year_albums >= ?'; countParams.push(parseInt(yearMin)); }
    if (yearMax) { countQuery += ' AND release_year_albums <= ?'; countParams.push(parseInt(yearMax)); }
    if (search) { countQuery += ' AND (album_title LIKE ? OR artist LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }

    const [countRows] = await pool.query(countQuery, countParams);

    res.status(200).json({
      data: rows,
      total: countRows[0].count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single album
const getAlbumById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM most_streamed_albums WHERE album_spotify_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Get albums by artist id
const getAlbumsByArtistId = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM most_streamed_albums WHERE artist_spotify_id = ?', [req.params.artistId]);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlbums,
  getAlbumById,
  getAlbumsByArtistId
};
