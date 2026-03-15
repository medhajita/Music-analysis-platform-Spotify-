const express = require('express');
const router = express.Router();
const { getTopSongs, getWorldSongs } = require('../controllers/songs');

router.get('/top', getTopSongs);
router.get('/world', getWorldSongs);

module.exports = router;
