import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import AlbumCard from '../components/albums/AlbumCard';
import TopAlbumsBarChart from '../components/albums/TopAlbumsBarChart';
import GainsComparisonChart from '../components/albums/GainsComparisonChart';
import AlbumsChoroplethMap from '../components/albums/AlbumsChoroplethMap';
import ReleaseYearHistogram from '../components/albums/ReleaseYearHistogram';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DataTable from '../components/common/DataTable';
import CountryFlag from '../components/common/CountryFlag';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  Globe2,
  Calendar,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { formatNumber } from '../utils/format';

const AlbumsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [yearRange, setYearRange] = useState({ min: 1950, max: 2026 });

  const { data: genres } = useApi('/genres');
  const { data: countries } = useApi('/countries');
  const selectedCountryOption = (countries || []).find((c) => (c.country_code || c.country) === countryFilter);

  // We fetch a larger limit for client-side features if needed, 
  // but for now we follow the user request for the API
  const { data: albumsData, loading, error } = useApi(
    `/albums?limit=100&search=${debouncedSearch}&genre=${genreFilter}&country=${countryFilter}&yearMin=${yearRange.min}&yearMax=${yearRange.max}`
  );
  const { data: mapAlbumsData } = useApi('/albums?limit=20000');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const columns = [
    { 
      key: 'album_title', 
      label: 'Album', 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.album_image_url} className="w-10 h-10 rounded shadow-lg border border-slate-700" alt="" />
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-tight">{row.album_title}</p>
            <p className="text-[10px] text-slate-500 font-medium italic">{row.release_year_albums}</p>
          </div>
        </div>
      )
    },
    { key: 'artist', label: 'Artiste', sortable: true },
    { 
      key: 'country', 
      label: 'Pays/Genre', 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CountryFlag code={row.country_code} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">{row.country || row.country_code || 'N/A'}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium">{row.genre}</span>
        </div>
      )
    },
    { 
      key: 'streams_albums', 
      label: 'Streams', 
      sortable: true, 
      format: (v) => <span className="text-emerald-400 font-bold">{formatNumber(v)}</span> 
    },
    { 
      key: 'weekly_gain_streams_albums', 
      label: 'Gain Hebdo', 
      sortable: true, 
      render: (row) => <span className="text-emerald-500/80 font-medium">{row.weekly_gain_streams_albums > 0 ? '+' : ''}{formatNumber(row.weekly_gain_streams_albums)}</span> 
    },
    { 
      key: 'monthly_gain_streams_albums', 
      label: 'Gain Mensuel', 
      sortable: true, 
      render: (row) => <span className="text-cyan-500/80 font-medium">{row.monthly_gain_streams_albums > 0 ? '+' : ''}{formatNumber(row.monthly_gain_streams_albums)}</span> 
    }
  ];

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">💿 Exploreur d'Albums</h1>
          <p className="text-slate-500 font-medium">Analyse des albums les plus streamés et tendances mondiales.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 self-start backdrop-blur-md">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <List size={20} />
          </button>
        </div>
      </header>

      {/* Filters Overlay */}
      <section className="bg-slate-950/20 p-6 rounded-3xl border border-slate-800/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Album ou artiste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl outline-none appearance-none cursor-pointer text-sm"
            >
              <option value="">Tous les Genres</option>
              {genres?.map(g => <option key={g.genre} value={g.genre}>{g.genre}</option>)}
            </select>
          </div>

          <div className="relative">
            <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl outline-none appearance-none cursor-pointer text-sm"
            >
              <option value="">Tous les Pays</option>
              {countries?.map(c => (
                <option key={`${c.country}-${c.country_code || 'NA'}`} value={c.country_code || c.country}>
                  {c.country} {c.country_code ? `(${c.country_code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 px-2 bg-slate-900/50 border border-slate-800 rounded-xl py-2">
            <Calendar size={18} className="text-slate-500" />
            <div className="flex-1 flex gap-2 items-center">
              <input 
                type="number" 
                min="1950" 
                max="2026"
                value={yearRange.min}
                onChange={(e) => setYearRange(prev => ({...prev, min: parseInt(e.target.value) || 1950}))}
                className="w-16 bg-transparent text-xs font-black border-b border-slate-700 outline-none p-1 text-emerald-400"
              />
              <span className="text-slate-600">-</span>
              <input 
                type="number" 
                min="1950" 
                max="2026"
                value={yearRange.max}
                onChange={(e) => setYearRange(prev => ({...prev, max: parseInt(e.target.value) || 2026}))}
                className="w-16 bg-transparent text-xs font-black border-b border-slate-700 outline-none p-1 text-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative">
        {viewMode === 'grid' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {(albumsData?.data || []).slice(0, 24).map(album => (
                <AlbumCard key={album.album_spotify_id} album={album} />
              ))}
            </div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={albumsData?.data || []} 
            loading={loading} 
            title="top_albums"
            pageSize={20}
          />
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
        <TopAlbumsBarChart data={albumsData?.data || []} />
        <GainsComparisonChart data={albumsData?.data || []} />
        <AlbumsChoroplethMap
          data={mapAlbumsData?.data || albumsData?.data || []}
          selectedCountryFilter={countryFilter}
          selectedCountryName={selectedCountryOption?.country}
        />
        <ReleaseYearHistogram data={albumsData?.data || []} />
      </div>
    </div>
  );
};

export default AlbumsPage;
