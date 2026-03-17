const express = require('express');
const router = express.Router();
const { getCountries, getCountryDetails } = require('../controllers/countriesController');

router.get('/', getCountries);
router.get('/:code/details', getCountryDetails);

module.exports = router;
