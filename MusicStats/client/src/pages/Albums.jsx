import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';
import useFetch from '../hooks/useFetch';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatNumber, formatWithCommas } from '../utils/formatNumbers';
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

export default function Albums() {
  const { data: rawData, loading, error } = useFetch('/api/albums');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Extract unique genres for dropdown
  const genres = useMemo(() => {
    if (!rawData) return ['All'];
    const unique = new Set(rawData.map(album => album.genre).filter(Boolean));
    return ['All', ...Array.from(unique).sort()];
  }, [rawData]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!rawData) return [];
    return rawData.filter(album => {
      const matchesSearch = 
        album.album_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        album.artist?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || album.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [rawData, searchTerm, selectedGenre]);

  // Derived datasets for charts based on filtered data
  const topStreamed = useMemo(() => [...filteredData].sort((a, b) => b.streams - a.streams).slice(0, 20), [filteredData]);
  
  // Area Chart: Streams by Year
  const streamsByYear = useMemo(() => {
    const yearMap = filteredData.reduce((acc, curr) => {
      if (!curr.release_year) return acc;
      acc[curr.release_year] = (acc[curr.release_year] || 0) + (curr.streams || 0);
      return acc;
    }, {});
    return Object.entries(yearMap)
      .map(([year, streams]) => ({ year, streams }))
      .sort((a, b) => a.year.localeCompare(b.year)); // Chronological
  }, [filteredData]);

  // Bar Chart: Albums per Artist (Top 10)
  const albumsPerArtist = useMemo(() => {
    const artistMap = filteredData.reduce((acc, curr) => {
      if (!curr.artist) return acc;
      acc[curr.artist] = (acc[curr.artist] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(artistMap)
      .map(([artist, count]) => ({ artist, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  // Pie Chart: Genre Distribution
  const genreDistribution = useMemo(() => {
    const genreMap = filteredData.reduce((acc, curr) => {
      const g = curr.genre || 'Unknown';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(genreMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  if (loading) return <Loader />;
  if (error) return <div className="page-container"><p style={{ color: 'var(--color-text-secondary)' }}>Error: {error}</p></div>;

  const tableColumns = [
    { key: 'rank', label: 'Rank', render: (_, __, i) => i + 1 },
    { key: 'album_name', label: 'Album Title', render: (val) => <strong style={{color: 'var(--color-text-primary)'}}>{val}</strong> },
    { key: 'artist', label: 'Artist Name' },
    { 
      key: 'streams', 
      label: 'Total Streams', 
      render: (val) => (
        <span 
          title={formatWithCommas(val)} 
          style={{ 
            cursor: 'help', 
            borderBottom: '1px dotted var(--color-text-muted)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
          onMouseLeave={(e) => e.target.style.color = 'inherit'}
        >
          {formatNumber(val)}
        </span>
      ) 
    },
    { key: 'release_year', label: 'Year' },
    { 
      key: 'genre', 
      label: 'Genre',
      render: (val) => (
        <span style={{ 
          background: 'var(--color-bg-secondary)', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '0.25rem',
          fontSize: '0.8rem',
          color: 'var(--color-accent)'
        }}>
          {val || 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Albums Analytics</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Explore historically dominant albums and release timelines.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--color-bg-card)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <IoSearchOutline style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search albums or artists..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '220px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <IoFilterOutline style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }} />
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              {genres.map(g => <option key={g} value={g} style={{ background: 'var(--color-bg-card)' }}>{g}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* 4 Charts Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 1200px) {
            .grid-item-full { grid-column: 1 / -1; }
          }
        `}} />

        {/* Chart 1: Top 20 Most Streamed Albums */}
        <div className="grid-item-full">
          <ChartCard title="Top 20 Most Streamed Albums">
            <div style={{ height: 450, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={topStreamed} margin={{ left: 100, right: 30, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => formatNumber(val)} />
                  <YAxis dataKey="album_name" type="category" stroke="var(--color-text-muted)" width={120} tick={{fontSize: 11}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="streams" name="Streams" radius={[0, 4, 4, 0]} animationDuration={1000}>
                    {topStreamed.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Albums Streams by Year */}
        <div className="grid-item-full">
          <ChartCard title="Albums Streams by Release Year">
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={streamsByYear} margin={{ left: 20, right: 30, top: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorStreamsArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--color-text-muted)" tick={{fontSize: 12}} minTickGap={20} />
                  <YAxis stroke="var(--color-text-muted)" tickFormatter={(val) => formatNumber(val)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="streams" name="Total Streams" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorStreamsArea)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 3: Albums per Artist (Top 10) */}
        <div className="grid-item-full">
          <ChartCard title="Number of Albums per Artist">
             <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={albumsPerArtist} margin={{ left: 0, right: 30, top: 20, bottom: 40 }}>
                   <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="artist" stroke="var(--color-text-muted)" angle={-45} textAnchor="end" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="count" name="Albums Listed" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 4: Genre Distribution of Albums (Donut) */}
        <div className="grid-item-full">
          <ChartCard title="Genre Distribution of Albums">
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }} />
                  <Pie
                    data={genreDistribution}
                    cx="40%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={1500}
                    stroke="var(--color-bg-card)"
                    strokeWidth={2}
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return percent > 0.05 ? (
                        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
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

      {/* DataTable Section */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
        Detailed Albums Registry ({filteredData.length})
      </h3>
      
      <DataTable columns={tableColumns} data={filteredData} />
    </div>
  );
}
