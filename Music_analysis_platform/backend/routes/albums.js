const express = require('express');
const router = express.Router();
const { getAlbums, getAlbumById, getAlbumsByArtistId } = require('../controllers/albumsController');

router.get('/', getAlbums);
router.get('/:id', getAlbumById);
router.get('/artist/:artistId', getAlbumsByArtistId);

module.exports = router;
