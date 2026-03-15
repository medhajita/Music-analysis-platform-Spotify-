const express = require('express');
const router = express.Router();
const { getAll, getYearlyTrend } = require('../controllers/genres');

router.get('/', getAll);
router.get('/yearly-trend', getYearlyTrend);

module.exports = router;
