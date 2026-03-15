const express = require('express');
const router = express.Router();
const { getAll, getTopByListeners, getStats } = require('../controllers/artists');

router.get('/', getAll);
router.get('/top', getTopByListeners);
router.get('/stats', getStats);

module.exports = router;
