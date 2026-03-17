const express = require('express');
const router = express.Router();
const { 
  getMostStreamedSongs, 
  getWorldwideSongs, 
  getSongsByCountry,
  getSongCoverage,
  getTopCountriesSongStreams,
  getMonthlyReleaseTrend,
  getGenreStreamsDistribution,
  getTopArtistsBySongStreams,
  getGenreSongCount,
  getSongById 
} = require('../controllers/songsController');

router.get('/most-streamed', getMostStreamedSongs);
router.get('/worldwide', getWorldwideSongs);
router.get('/by-country', getSongsByCountry);
router.get('/coverage', getSongCoverage);
router.get('/top-countries-streams', getTopCountriesSongStreams);
router.get('/release-trend', getMonthlyReleaseTrend);
router.get('/genre-distribution', getGenreStreamsDistribution);
router.get('/top-artists-streams', getTopArtistsBySongStreams);
router.get('/genre-song-count', getGenreSongCount);
router.get('/:id', getSongById);

module.exports = router;
