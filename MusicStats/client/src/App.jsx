import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Artists from './pages/Artists';
import Albums from './pages/Albums';
import Songs from './pages/Songs';
import Genres from './pages/Genres';
import Countries from './pages/Countries';
import SearchArtist from './pages/SearchArtist';

function App() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/search" element={<SearchArtist />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
