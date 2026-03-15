import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';
import { IoDownloadOutline, IoSearchOutline } from 'react-icons/io5';
import useFetch from '../hooks/useFetch';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatNumber, formatWithCommas } from '../utils/formatNumbers';
import { exportToCsv } from '../utils/exportCsv';

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

export default function Artists() {
  const { data: rawData, loading, error } = useFetch('/api/artists');
  const [searchTerm, setSearchTerm] = useState('');
  const [minStreams, setMinStreams] = useState(0);

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!rawData) return [];
    return rawData.filter(artist => {
      const matchesSearch = artist.artist?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStreams = (artist.streams || 0) >= minStreams;
      return matchesSearch && matchesStreams;
    });
  }, [rawData, searchTerm, minStreams]);

  // Derived datasets for charts based on filtered data
  const topListened = useMemo(() => [...filteredData].sort((a, b) => b.listeners - a.listeners).slice(0, 15), [filteredData]);
  const topStreamed = useMemo(() => [...filteredData].sort((a, b) => b.streams - a.streams).slice(0, 15), [filteredData]);
  const topFollowed = useMemo(() => [...filteredData].sort((a, b) => b.followers - a.followers).slice(0, 15), [filteredData]);
  
  // For Composed Chart (Title Stats Overview based on Top 15 Streamed for relevance)
  const titleStatsData = useMemo(() => {
    return topStreamed.map(item => ({
      artist: item.artist,
      titles_count: item.titles_count || 0,
      avg_streams_per_title: item.titles_count && item.titles_count > 0 
        ? Math.floor(item.streams / item.titles_count) 
        : 0
    }));
  }, [topStreamed]);

  const handleExport = () => {
    if (filteredData.length) {
      exportToCsv('musicstats_artists.csv', filteredData);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="page-container"><p style={{ color: 'var(--color-text-secondary)' }}>Error: {error}</p></div>;

  const tableColumns = [
    { key: 'rank', label: 'Rank', render: (_, __, i) => i + 1 },
    { key: 'artist', label: 'Artist Name', render: (val) => <strong style={{color: 'var(--color-text-primary)'}}>{val}</strong> },
    { key: 'listeners', label: 'Listeners', render: (val) => formatWithCommas(val) },
    { key: 'streams', label: 'Total Streams', render: (val) => formatWithCommas(val) },
    { key: 'followers', label: 'Followers', render: (val) => formatWithCommas(val) },
    { key: 'titles_count', label: 'Titles Count' }
  ];

  return (
    <div className="animate-fade-in-up">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Artists Overview</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Deep dive into artist performance metrics and catalogs.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--color-bg-card)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <IoSearchOutline style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search artists..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '160px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
              <span>Min Streams</span>
              <span>{formatNumber(minStreams)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000000000" 
              step="100000000" 
              value={minStreams} 
              onChange={(e) => setMinStreams(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
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

        {/* Chart 1: Top 15 Most Listened */}
        <div className="grid-item-full">
          <ChartCard title="Top 15 Most Listened Artists">
            <div style={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={topListened} margin={{ left: 60, right: 30, top: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => formatNumber(val)} />
                  <YAxis dataKey="artist" type="category" stroke="var(--color-text-muted)" width={100} tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="listeners" name="Listeners" fill="url(#pinkGradient)" radius={[0, 4, 4, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Top 15 Most Streamed */}
        <div className="grid-item-full">
          <ChartCard title="Top 15 Most Streamed Artists">
            <div style={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={topStreamed} margin={{ left: 60, right: 30, top: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => formatNumber(val)} />
                  <YAxis dataKey="artist" type="category" stroke="var(--color-text-muted)" width={100} tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="streams" name="Streams" fill="url(#blueGradient)" radius={[0, 4, 4, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 3: Top 15 Most Followed */}
        <div className="grid-item-full">
          <ChartCard title="Top 15 Most Followed Artists">
            <div style={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={topFollowed} margin={{ left: 60, right: 30, top: 10, bottom: 5 }}>
                   <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="var(--color-accent-secondary)" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => formatNumber(val)} />
                  <YAxis dataKey="artist" type="category" stroke="var(--color-text-muted)" width={100} tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="followers" name="Followers" fill="url(#greenGradient)" radius={[0, 4, 4, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 4: Title Stats Overview (Composed) */}
        <div className="grid-item-full">
          <ChartCard title="Artist Title Stats Overview (Top Streamed)">
            <div style={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <ComposedChart data={titleStatsData} margin={{ left: 10, right: 10, top: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="artist" stroke="var(--color-text-muted)" angle={-45} textAnchor="end" tick={{fontSize: 12}} height={60} />
                  <YAxis yAxisId="left" stroke="var(--color-text-muted)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-accent)" tickFormatter={(val) => formatNumber(val)} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar yAxisId="left" dataKey="titles_count" name="Titles Count" fill="#a855f7" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  <Line yAxisId="right" type="monotone" dataKey="avg_streams_per_title" name="Avg Streams/Title" stroke="var(--color-accent)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} animationDuration={1500} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* DataTable Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Detailed Artist Data ({filteredData.length})
        </h3>
        <button 
          onClick={handleExport}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            background: 'var(--color-accent)', 
            color: '#000', 
            border: 'none', 
            borderRadius: '0.5rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 0 10px rgba(29, 185, 84, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
        >
          <IoDownloadOutline size={18} />
          Export CSV
        </button>
      </div>
      
      <DataTable columns={tableColumns} data={filteredData} />
    </div>
  );
}
