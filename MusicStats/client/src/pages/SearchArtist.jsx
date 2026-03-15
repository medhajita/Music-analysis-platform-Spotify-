import React, { useState, useEffect, useRef } from 'react';
import { IoSearchOutline, IoTimeOutline, IoMusicalNotesOutline, IoPeopleOutline, IoStatsChartOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { formatCompactNumber, formatWithCommas } from '../utils/formatNumbers';

// --- Components ---

const LoadingSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-8">
    <div className="h-64 bg-gray-800/50 rounded-2xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-gray-800/50 rounded-xl"></div>
      ))}
    </div>
  </div>
);

const StatBar = ({ label, value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-white">{formatCompactNumber(value)}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

export default function SearchArtist() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null); // { db: artistObj, lastfm: infoObj }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('musicstats_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));

    // Handle clicking outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  const handleSearch = async (name) => {
    setQuery(name);
    setShowDropdown(false);
    setLoading(true);
    setError(null);
    setResults(null);

    // Save to recent searches
    const updatedRecent = [name, ...recentSearches.filter(s => s !== name)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('musicstats_recent_searches', JSON.stringify(updatedRecent));

    try {
      const [dbRes, lastfmRes] = await Promise.all([
        fetch(`/api/search/detail?name=${encodeURIComponent(name)}`),
        fetch(`/api/search/lastfm?name=${encodeURIComponent(name)}`)
      ]);

      const dbData = await dbRes.json();
      const lastfmData = await lastfmRes.json();

      if (!dbData && !lastfmData) {
        setError('No artist found matching that name.');
      } else {
        setResults({ db: dbData, lastfm: lastfmData });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while fetching artist details.');
    } finally {
      setLoading(false);
    }
  };

  const [isBioExpanded, setIsBioExpanded] = useState(false);

  return (
    <div className="animate-fade-in-up">
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8">
          Artist Recon
        </h1>
        
        {/* Search Bar Container */}
        <div className="relative w-full max-w-2xl" ref={dropdownRef}>
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-2xl focus-within:border-purple-500/50 transition-all">
            <IoSearchOutline className="text-gray-400 mr-4" size={24} />
            <input 
              type="text"
              placeholder="Search any artist..."
              className="bg-transparent border-none outline-none text-white text-lg w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && query && handleSearch(query)}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(s.artist)}
                  className="w-full flex items-center p-3 text-left hover:bg-purple-500/10 transition-colors border-b border-gray-800 last:border-b-0"
                >
                  <IoMusicalNotesOutline className="text-purple-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">{s.artist}</p>
                    <p className="text-xs text-gray-500">{s.genre} • {s.country}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {recentSearches.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => handleSearch(s)}
                className="flex items-center px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-sm text-gray-400 hover:text-white rounded-full transition-all border border-gray-800"
              >
                <IoTimeOutline size={14} className="mr-2" />
                {s}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Results Section */}
      <main className="max-w-6xl mx-auto">
        {loading && <LoadingSkeleton />}

        {error && (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
            <IoAlertCircleOutline size={64} className="mb-4 text-pink-500" />
            <p className="text-xl">{error}</p>
            <button onClick={() => setQuery('')} className="mt-4 text-purple-400 hover:underline">Clear search</button>
          </div>
        )}

        {results && (
          <div className="animate-fade-in-up">
            {/* Top Info Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl mb-8 flex flex-col md:flex-row">
              {/* Left Panel: Photo & Basics */}
              <div className="md:w-1/3 p-8 border-r border-gray-800 bg-gradient-to-b from-gray-900 to-black/40">
                <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-xl border-2 border-purple-500/20">
                  {results.lastfm?.image ? (
                    <img src={results.lastfm.image} alt={results.db?.artist || results.lastfm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      <IoPeopleOutline size={64} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-white leading-tight">
                    {results.db?.artist || results.lastfm.name}
                  </h2>
                </div>
                
                {!results.db && (
                  <span className="inline-block px-3 py-1 bg-pink-500/10 text-pink-500 text-xs font-bold rounded-full border border-pink-500/20 mb-4">
                    LAST.FM DATA ONLY
                  </span>
                )}

                <div className="space-y-3">
                  {results.db?.country && (
                    <p className="text-gray-400 flex items-center">
                      <span className="w-20 text-xs uppercase tracking-wider font-bold">Country</span>
                      <span className="text-white">{results.db.country}</span>
                    </p>
                  )}
                  {results.lastfm?.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {results.lastfm.tags.slice(0, 3).map(t => (
                        <span key={t} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Stats & Bio */}
              <div className="md:w-2/3 p-8 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-6 flex items-center">
                    <IoStatsChartOutline className="mr-2 text-purple-500" />
                    Performance Overview
                  </h3>
                  
                  {results.db ? (
                    <div className="grid grid-cols-1 gap-4">
                      <StatBar label="Global Streams" value={results.db.streams} max={5000000000} color="#a855f7" />
                      <StatBar label="Monthly Listeners" value={results.db.listeners} max={100000000} color="#ec4899" />
                      <StatBar label="Followers" value={results.db.followers} max={100000000} color="#0ea5e9" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <StatBar label="Last.fm Listeners" value={results.lastfm.stats.listeners} max={5000000} color="#3b82f6" />
                      <StatBar label="Last.fm Playcount" value={results.lastfm.stats.playcount} max={500000000} color="#ef4444" />
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Biography</h3>
                  <div 
                    className={`text-gray-400 leading-relaxed transition-all duration-300 ${isBioExpanded ? '' : 'line-clamp-3'}`}
                    dangerouslySetInnerHTML={{ __html: results.lastfm?.bio || 'No biography available.' }}
                  ></div>
                  {results.lastfm?.bio && results.lastfm.bio.length > 200 && (
                    <button 
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
                    >
                      {isBioExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Grid: Songs & Similar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
               {/* Top Songs (Mock or DB if we had track table, using Last.fm data if not) */}
               <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                 <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                   <IoMusicalNotesOutline className="mr-2 text-purple-500" />
                   Featured Tracks
                 </h3>
                 <div className="space-y-4">
                   {/* We don't have a direct tracks table joined in detail, 
                       so we'll simulate based on known tracks count or just placeholder */}
                   {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all border border-transparent hover:border-purple-500/20">
                       <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                           0{i}
                         </div>
                         <span className="text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            {results.db?.artist || results.lastfm.name} Hit #{i}
                         </span>
                       </div>
                       <span className="text-xs text-gray-500">Popularity: 9{9-i}%</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Similar Artists (Last.fm) */}
               <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                 <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <IoPeopleOutline className="mr-2 text-pink-500" />
                    Similar Artists
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                   {results.lastfm?.similar?.slice(0, 4).map((artist, idx) => (
                     <button 
                       key={idx}
                       onClick={() => handleSearch(artist.name)}
                       className="group text-left"
                     >
                       <div className="aspect-square rounded-2xl overflow-hidden mb-2 relative">
                         {artist.image ? (
                           <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                           <div className="w-full h-full bg-gray-800" />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">RECON →</span>
                         </div>
                       </div>
                       <p className="text-sm font-semibold text-gray-400 group-hover:text-purple-400 transition-colors truncate">
                         {artist.name}
                       </p>
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
