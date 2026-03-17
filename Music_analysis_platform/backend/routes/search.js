const express = require('express');
const router = express.Router();
const { searchArtist, getArtistStreamedCountries } = require('../controllers/searchController');

router.get('/artist', searchArtist);
router.get('/artist-streamed-countries', getArtistStreamedCountries);

module.exports = router;
