const express = require('express');
const router = express.Router();
const { searchByName, getArtistDetail, getLastFmInfo } = require('../controllers/search');

router.get('/', searchByName);
router.get('/detail', getArtistDetail);
router.get('/lastfm', getLastFmInfo);

module.exports = router;
