import React, { useMemo, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import GenreCard from '../components/genres/GenreCard';
import GenrePieDonutChart from '../components/genres/GenrePieDonutChart';
import TopGenresBarChart from '../components/genres/TopGenresBarChart';
import { Search, Filter, Grid, List, Activity, Music, Users, Disc } from 'lucide-react';

const GenresPage = () => {
  const { data: genres, loading, error } = useApi('/genres');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);

  const filteredGenres = useMemo(() => {
    if (!genres) return [];
    return genres.filter(g => 
      g.genre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      Number(g.artists_count) > 0
    );
  }, [genres, searchTerm]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Analyse des Genres Musicaux
          </h1>
          <p className="text-slate-400 mt-1">Exploration des tendances et domination du marché par style</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un genre..."
            className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full md:w-64 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Analytics Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GenrePieDonutChart data={genres} />
        <TopGenresBarChart data={genres} />
      </div>

      {/* Genres Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-500" />
            Explorateur de Genres
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGenres.slice(0, 40).map((genre) => (
            <GenreCard 
              key={genre.genre} 
              genre={genre} 
              onClick={() => setSelectedGenre(genre)}
            />
          ))}
        </div>
        
        {filteredGenres.length > 40 && (
          <div className="flex justify-center pt-8">
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors">
              Charger plus de genres
            </button>
          </div>
        )}
      </div>

      {/* Genre Detail Modal (Simple Implementation) */}
      {selectedGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200" onClick={() => setSelectedGenre(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors"
              onClick={() => setSelectedGenre(null)}
            >
              <Users className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-bold text-purple-400 mb-2">{selectedGenre.genre}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-sm">Top Artiste</p>
                <p className="text-xl font-semibold">{selectedGenre.top_artist || 'N/A'}</p>
                <p className="text-xs text-purple-400">{(selectedGenre.top_artist_streams / 1e9).toFixed(1)} Bn streams</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-sm">Top Album</p>
                <p className="text-xl font-semibold">{selectedGenre.top_album || 'N/A'}</p>
                <p className="text-xs text-pink-400">{(selectedGenre.top_album_streams / 1e6).toFixed(1)} Mn streams</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Pays d'influence</h3>
              <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2">
                {selectedGenre.countries?.split(', ').map(country => (
                  <span key={country} className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-300">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenresPage;
