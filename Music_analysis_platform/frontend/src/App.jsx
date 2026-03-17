import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ArtistsPage from './pages/ArtistsPage';
import AlbumsPage from './pages/AlbumsPage';
import SongsPage from './pages/SongsPage';
import GenresPage from './pages/GenresPage';
import CountriesPage from './pages/CountriesPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="artists" element={<ArtistsPage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="songs" element={<SongsPage />} />
          <Route path="genres" element={<GenresPage />} />
          <Route path="countries" element={<CountriesPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
