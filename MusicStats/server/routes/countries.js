const express = require('express');
const router = express.Router();
const { getAll, getStats } = require('../controllers/countries');

router.get('/', getAll);
router.get('/stats', getStats);

module.exports = router;
