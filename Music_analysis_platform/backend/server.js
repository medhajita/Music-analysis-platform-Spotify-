const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler } = require('./middlewares/errorHandler');
const { logRequests } = require('./middlewares/logRequests');

// Load env vars
dotenv.config();

const app = express();

// Middlewares
app.use(logRequests);
app.use(express.json());
app.use(cors());

// Import Routes
const artistRoutes = require('./routes/artists');
const albumRoutes = require('./routes/albums');
const songRoutes = require('./routes/songs');
const genreRoutes = require('./routes/genres');
const countryRoutes = require('./routes/countries');
const statsRoutes = require('./routes/stats');
const searchRoutes = require('./routes/search');

// Define Routes
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Custom error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

