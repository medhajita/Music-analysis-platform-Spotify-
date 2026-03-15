import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';
import useFetch from '../hooks/useFetch';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatCompactNumber, formatWithCommas } from '../utils/formatNumbers';
import colorPalette from '../utils/colorPalette';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        {label && <p className="label">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.fill || 'var(--color-text-primary)' }}>
            {entry.name}: {formatWithCommas(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Songs() {
  const { data: topSongsRaw, loading: loadingTop, error: errorTop } = useFetch('/api/songs/top');
  const { data: worldSongsRaw, loading: loadingWorld, error: errorWorld } = useFetch('/api/songs/world');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [minStreams, setMinStreams] = useState(0);
  const [activeTab, setActiveTab] = useState('top'); // 'top' or 'world'

  // --- Data processing for Top Songs ---
  const genres = useMemo(() => {
    if (!topSongsRaw) return ['All'];
    const unique = new Set(topSongsRaw.map(s => s.genre).filter(Boolean));
    return ['All', ...Array.from(unique).sort()];
  }, [topSongsRaw]);

  const maxPossibleStreams = useMemo(() => {
    if (!topSongsRaw?.length) return 1000000;
    return Math.max(...topSongsRaw.map(s => s.streams || 0));
  }, [topSongsRaw]);

  // Client-side filtering for Top Songs
  const filteredTopSongs = useMemo(() => {
    if (!topSongsRaw) return [];
    return topSongsRaw.filter(song => {
      const matchesSearch = 
        song.song_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        song.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
      const matchesStreams = (song.streams || 0) >= minStreams;
      return matchesSearch && matchesGenre && matchesStreams;
    });
  }, [topSongsRaw, searchTerm, selectedGenre, minStreams]);

  // Client-side filtering for World Songs (syncs search and stream range, ignores genre as it's not present)
  const filteredWorldSongs = useMemo(() => {
    if (!worldSongsRaw) return [];
    return worldSongsRaw.filter(song => {
      const matchesSearch = 
        song.song_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        song.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStreams = (song.streams || 0) >= minStreams;
      return matchesSearch && matchesStreams;
    });
  }, [worldSongsRaw, searchTerm, minStreams]);

  // --- Derived Datasets for Charts ---

  // Chart 1: Top 20 Most Streamed Songs (from filteredTopSongs)
  const top20Songs = useMemo(() => {
    return [...filteredTopSongs]
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 20)
      .map(s => ({
        ...s,
        displayName: `${s.song_name} - ${s.artist_name}`
      }));
  }, [filteredTopSongs]);

  // Chart 2: Songs Popularity Around the World (from filteredWorldSongs)
  const topCountries = useMemo(() => {
    const countryMap = filteredWorldSongs.reduce((acc, curr) => {
      if (!curr.country) return acc;
      acc[curr.country] = (acc[curr.country] || 0) + (curr.streams || 0);
      return acc;
    }, {});
    
    return Object.entries(countryMap)
      .map(([country, streams]) => ({ country, streams }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 10);
  }, [filteredWorldSongs]);

  // Chart 3: Monthly Release Trend (using release_date from filteredTopSongs)
  const releaseTrends = useMemo(() => {
    const yearMap = filteredTopSongs.reduce((acc, curr) => {
      if (!curr.release_date) return acc;
      // Convert year to string safely
      const year = String(curr.release_date).substring(0, 4);
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(yearMap)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredTopSongs]);

  // Chart 4: Genre Distribution (from filteredTopSongs)
  const genreDistribution = useMemo(() => {
    const genreMap = filteredTopSongs.reduce((acc, curr) => {
      const g = curr.genre || 'Unknown';
      acc[g] = (acc[g] || 0) + (curr.streams || 0);
      return acc;
    }, {});
    
    return Object.entries(genreMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12); // Keep pie chart readable
  }, [filteredTopSongs]);


  if (loadingTop || loadingWorld) return <Loader />;
  if (errorTop || errorWorld) return <div className="page-container"><p style={{ color: 'var(--color-text-secondary)' }}>Error loading data.</p></div>;

  // --- DataTable configurations ---
  const activeDataset = activeTab === 'top' ? filteredTopSongs : filteredWorldSongs;
  
  const topSongsColumns = [
    { key: 'rank', label: 'Rank', render: (_, __, i) => i + 1 },
    { key: 'song_name', label: 'Song Title', render: (val) => <strong style={{color: 'var(--color-text-primary)'}}>{val}</strong> },
    { key: 'artist_name', label: 'Artist Name' },
    { 
      key: 'streams', 
      label: 'Global Streams',
      render: (val) => (
        <span 
          title={formatWithCommas(val)} 
          style={{ cursor: 'help', borderBottom: '1px dotted var(--color-text-muted)', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={(e) => e.target.style.color = 'inherit'}
        >
          {formatCompactNumber(val)}
        </span>
      )
    },
    { key: 'genre', label: 'Genre', render: (val) => (
       <span style={{ background: 'var(--color-bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', color: 'var(--color-accent)' }}>
         {val || 'N/A'}
       </span>
    )},
    { key: 'release_date', label: 'Release' }
  ];

  const worldSongsColumns = [
    { key: 'rank', label: 'Rank', render: (_, __, i) => i + 1 },
    { key: 'song_name', label: 'Song Title', render: (val) => <strong style={{color: 'var(--color-text-primary)'}}>{val}</strong> },
    { key: 'artist_name', label: 'Artist Name' },
    { key: 'country', label: 'Country', render: (val) => <span style={{color: '#a855f7', fontWeight: 500}}>{val}</span> },
    { 
      key: 'streams', 
      label: 'Country Streams',
      render: (val) => (
        <span 
          title={formatWithCommas(val)} 
          style={{ cursor: 'help', borderBottom: '1px dotted var(--color-text-muted)', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={(e) => e.target.style.color = 'inherit'}
        >
          {formatCompactNumber(val)}
        </span>
      )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Global Songs Analytics</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Explore track popularity, regional trends, and release cadences.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-bg-card)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', width: '100%', maxWidth: '600px' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
              <IoSearchOutline style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search songs, artists, or countries..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', width: '200px' }}>
              <IoFilterOutline style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }} />
              <select 
                value={selectedGenre} 
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer', width: '100%' }}
              >
                {genres.map(g => <option key={g} value={g} style={{ background: 'var(--color-bg-card)' }}>{g}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <span>Min Streams (Top Songs): <strong>{formatCompactNumber(minStreams)}</strong></span>
                <span>Max: {formatCompactNumber(maxPossibleStreams)}</span>
             </div>
             <input 
                type="range" 
                min="0" 
                max={maxPossibleStreams} 
                step="50000000"
                value={minStreams} 
                onChange={(e) => setMinStreams(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
          </div>

        </div>
      </header>

      {/* 4 Charts Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 1400px) {
            .grid-item-full { grid-column: 1 / -1; }
          }
        `}} />

        {/* Chart 1: Top 20 Most Streamed Songs */}
        <div className="grid-item-full">
          <ChartCard title="Top 20 Most Streamed Songs">
             <div style={{ height: 500, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={top20Songs} margin={{ left: 180, right: 30, top: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorPinkPurple" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => formatCompactNumber(val)} />
                  <YAxis dataKey="displayName" type="category" stroke="var(--color-text-muted)" width={170} tick={{fontSize: 11}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="streams" name="Streams" fill="url(#colorPinkPurple)" radius={[0, 4, 4, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Songs Popularity Around the World */}
        <div className="grid-item-full">
          <ChartCard title="Songs Popularity by Country (Top 10)">
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={topCountries} margin={{ left: 20, right: 30, top: 20, bottom: 40 }}>
                   <defs>
                    <linearGradient id="colorCyanBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="country" stroke="var(--color-text-muted)" angle={-45} textAnchor="end" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--color-text-muted)" tickFormatter={(val) => formatCompactNumber(val)} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="streams" name="Total Country Streams" fill="url(#colorCyanBlue)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 3: Monthly Release Trend */}
        <div className="grid-item-full">
          <ChartCard title="Top Songs Release Year Trend">
             <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={releaseTrends} margin={{ left: 0, right: 30, top: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--color-text-muted)" tick={{fontSize: 12}} minTickGap={10} />
                  <YAxis stroke="var(--color-text-muted)" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="Songs Released" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7'}} activeDot={{r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 2}} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 4: Streams Distribution by Genre */}
        <div className="grid-item-full">
          <ChartCard title="Streams Distribution by Genre">
             <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }} />
                  <Pie
                    data={genreDistribution}
                    cx="40%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={1500}
                    stroke="var(--color-bg-card)"
                    strokeWidth={2}
                  >
                    {genreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

      </div>

      {/* Tabbed DataTable Section */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('top')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            color: activeTab === 'top' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            position: 'relative'
          }}
        >
          Most Streamed Registry ({filteredTopSongs.length})
          {activeTab === 'top' && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '3px', background: 'var(--color-accent)', borderRadius: '3px' }} />}
        </button>
        <button 
          onClick={() => setActiveTab('world')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            color: activeTab === 'world' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            position: 'relative'
          }}
        >
          Global Streams Data ({filteredWorldSongs.length})
          {activeTab === 'world' && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '3px', background: 'var(--color-accent)', borderRadius: '3px' }} />}
        </button>
      </div>
      
      <DataTable 
        columns={activeTab === 'top' ? topSongsColumns : worldSongsColumns} 
        data={activeDataset} 
      />
    </div>
  );
}
