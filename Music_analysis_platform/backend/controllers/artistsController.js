const pool = require('../config/db');

const applyArtistFilters = (query, params, { country, genre, search }) => {
  let nextQuery = query;

  if (genre) {
    nextQuery += ' AND genre = ?';
    params.push(genre);
  }

  if (country) {
    nextQuery += ' AND country = ?';
    params.push(country);
  }

  if (search) {
    nextQuery += ' AND artist LIKE ?';
    params.push(`%${search}%`);
  }

  return nextQuery;
};

// @desc    Get artists with filtering, sorting and pagination
// @route   GET /api/artists
const getArtists = async (req, res, next) => {
  try {
    const { 
      sort = 'total_streams', 
      order = 'DESC', 
      limit = 50, 
      offset = 0, 
      genre, 
      country, 
      search 
    } = req.query;

    let query = 'SELECT * FROM artists WHERE 1=1';
    const params = [];
    query = applyArtistFilters(query, params, { country, genre, search });

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ['artist', 'followers', 'daily_gain_followers', 'weekly_gain_followers', 'listeners', 'total_streams', 'tracks', 'country', 'genre'];
    const sortCol = allowedSortColumns.includes(sort) ? sort : 'total_streams';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    // Also get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM artists WHERE 1=1';
    const countParams = [];
    countQuery = applyArtistFilters(countQuery, countParams, { country, genre, search });
    
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

// @desc    Get top artists by listeners
// @route   GET /api/artists/top-listeners
const getTopListeners = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { country, genre, search } = req.query;
    const params = [];
    let query = 'SELECT * FROM artists WHERE 1=1';
    query = applyArtistFilters(query, params, { country, genre, search });
    query += ' ORDER BY listeners DESC LIMIT ?';
    params.push(limit);
    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top artists by followers
// @route   GET /api/artists/top-followers
const getTopFollowers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { country, genre, search } = req.query;
    const params = [];
    let query = 'SELECT * FROM artists WHERE 1=1';
    query = applyArtistFilters(query, params, { country, genre, search });
    query += ' ORDER BY followers DESC LIMIT ?';
    params.push(limit);
    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get top artists by streams
// @route   GET /api/artists/top-streams
const getTopStreams = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { country, genre, search } = req.query;
    const params = [];
    let query = 'SELECT * FROM artists WHERE 1=1';
    query = applyArtistFilters(query, params, { country, genre, search });
    query += ' ORDER BY total_streams DESC LIMIT ?';
    params.push(limit);
    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get track stats for artists
// @route   GET /api/artists/track-stats
const getTrackStats = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [rows] = await pool.query(
      'SELECT artist, tracks, streams_1B, streams_100M, streams_10M, streams_1M FROM artists ORDER BY tracks DESC LIMIT ?', 
      [limit]
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single artist
const getArtistById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artists WHERE artist_spotify_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArtists,
  getArtistById,
  getTopListeners,
  getTopFollowers,
  getTopStreams,
  getTrackStats
};
