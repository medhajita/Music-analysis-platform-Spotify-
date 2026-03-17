const express = require('express');
const router = express.Router();
const { 
  getArtists, 
  getArtistById, 
  getTopListeners, 
  getTopFollowers, 
  getTopStreams, 
  getTrackStats 
} = require('../controllers/artistsController');

router.get('/', getArtists);
router.get('/top-listeners', getTopListeners);
router.get('/top-followers', getTopFollowers);
router.get('/top-streams', getTopStreams);
router.get('/track-stats', getTrackStats);
router.get('/:id', getArtistById);

module.exports = router;
