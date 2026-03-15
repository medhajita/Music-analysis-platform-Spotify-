const express = require('express');
const router = express.Router();
const { getAll, getStats } = require('../controllers/albums');

router.get('/', getAll);
router.get('/stats', getStats);

module.exports = router;
