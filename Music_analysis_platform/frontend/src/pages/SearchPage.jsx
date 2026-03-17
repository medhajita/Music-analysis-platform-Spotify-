import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ArtistCard from '../components/search/ArtistCard';
import SuggestionForm from '../components/search/SuggestionForm';
import { Search, Users, X, Info, AlertTriangle, ArrowLeftRight } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchTimeout = useRef(null);

  const fetchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSource(null);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/search/artist?q=${encodeURIComponent(searchTerm)}`);
      setResults(response.data.results || []);
      setSource(response.data.source);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (query.length > 1) {
      searchTimeout.current = setTimeout(() => {
        fetchResults(query);
      }, 300);
    } else {
      setResults([]);
      setSource(null);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, fetchResults]);

  const toggleArtistSelection = (artist) => {
    const isSelected = selectedArtists.find(a => a.artist === artist.artist);
    if (isSelected) {
      setSelectedArtists(selectedArtists.filter(a => a.artist !== artist.artist));
    } else {
      if (selectedArtists.length < 2) {
        setSelectedArtists([...selectedArtists, artist]);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
            Explorateur d'Artistes
          </h1>
          <p className="text-slate-400">Recherchez un artiste pour une analyse profonde de ses streams et de sa croissance.</p>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl group-focus-within:opacity-100 opacity-20 transition-opacity rounded-2xl" />
          <div className="relative flex items-center px-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 focus-within:border-purple-500/50 rounded-2xl transition-all shadow-2xl">
            <Search className="w-6 h-6 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              placeholder="Ex: Taylor Swift, Drake, Metallica..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-xl px-4 text-slate-100 placeholder-slate-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Toggle */}
      {selectedArtists.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-right duration-300">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="flex -space-x-3">
              {selectedArtists.map(a => (
                <div key={a.artist} className="w-12 h-12 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                  <img src={a.artist_image_url || 'https://via.placeholder.com/150'} alt={a.artist} className="w-full h-full object-cover" />
                </div>
              ))}
              {selectedArtists.length < 2 && (
                <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-slate-500 dashed border-slate-700">
                  <Users className="w-5 h-5" />
                </div>
              )}
            </div>
            <button 
              disabled={selectedArtists.length < 2}
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${
                selectedArtists.length === 2 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              {comparisonMode ? 'Quitter la comparaison' : 'Comparer'}
            </button>
            <button onClick={() => setSelectedArtists([])} className="text-slate-500 hover:text-slate-200 px-2">Annuler</button>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4">
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {source === 'lastfm' && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Info className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-amber-200">Données limitées (Source : Last.fm)</p>
              <p className="text-sm text-amber-200/60">Cet artiste n'est pas encore dans notre base de données analytique interne.</p>
            </div>
          </div>
        )}

        {source === 'none' && query.length > 2 && !loading && (
          <div className="text-center py-20 space-y-6">
            <div className="inline-block p-4 bg-slate-900 rounded-full border border-slate-800">
              <AlertTriangle className="w-12 h-12 text-slate-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Aucun résultat trouvé</h2>
              <p className="text-slate-400">Désolé, nous n'avons trouvé aucun artiste correspondant à "{query}"</p>
            </div>
            <button 
              onClick={() => setShowSuggestions(true)}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
            >
              Proposer cet artiste
            </button>
          </div>
        )}

        <div className={`grid gap-8 ${comparisonMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {comparisonMode ? (
            selectedArtists.map(artist => (
              <ArtistCard 
                key={artist.artist} 
                artist={artist} 
                source={source} 
                isComparison 
              />
            ))
          ) : (
            results.length > 0 && results.slice(0, 1).map(artist => (
              <ArtistCard 
                key={artist.artist} 
                artist={artist} 
                source={source} 
                onCompare={() => toggleArtistSelection(artist)}
                isSelected={selectedArtists.some(a => a.artist === artist.artist)}
              />
            ))
          )}
        </div>

        {/* Other Results Grid */}
        {!comparisonMode && results.length > 1 && (
          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-400">
              <Users className="w-5 h-5" />
              Autres résultats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.slice(1).map(artist => (
                <div 
                  key={artist.artist}
                  onClick={() => {
                    setResults([artist, ...results.filter(a => a.artist !== artist.artist)]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-purple-500/30 cursor-pointer transition-all flex items-center gap-4"
                >
                  <img 
                    src={artist.artist_image_url || 'https://via.placeholder.com/150'} 
                    alt={artist.artist} 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                  <div>
                    <h4 className="font-bold">{artist.artist}</h4>
                    <p className="text-xs text-slate-500">{artist.genre} • {artist.country || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <SuggestionForm 
          artistName={query} 
          onClose={() => setShowSuggestions(false)} 
        />
      )}
    </div>
  );
};

export default SearchPage;
