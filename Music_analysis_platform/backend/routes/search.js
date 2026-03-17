const express = require('express');
const router = express.Router();
const { searchArtist } = require('../controllers/searchController');

router.get('/artist', searchArtist);

module.exports = router;
