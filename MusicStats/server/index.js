require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const artistRoutes = require('./routes/artists');
const albumRoutes = require('./routes/albums');
const songRoutes = require('./routes/songs');
const genreRoutes = require('./routes/genres');
const countryRoutes = require('./routes/countries');
const searchRoutes = require('./routes/search');
const statsRoutes = require('./routes/stats');

app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MusicStats server running on http://localhost:${PORT}`);
});
