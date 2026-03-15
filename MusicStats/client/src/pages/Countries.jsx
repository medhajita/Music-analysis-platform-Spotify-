import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, Legend
} from 'recharts';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';
import useFetch from '../hooks/useFetch';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { formatCompactNumber, formatWithCommas } from '../utils/formatNumbers';
import colorPalette from '../utils/colorPalette';

// Utility to get a flag emoji safely from a country name
const getFlagEmoji = (countryName) => {
  const customMap = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'Colombia': '🇨🇴',
    'Argentina': '🇦🇷',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'South Korea': '🇰🇷',
    'India': '🇮🇳',
    'Puerto Rico': '🇵🇷',
    'Nigeria': '🇳🇬',
    'South Africa': '🇿🇦',
    'Sweden': '🇸🇪',
    'Netherlands': '🇳🇱',
    'Philippines': '🇵🇭',
    'Indonesia': '🇮🇩'
  };
  return customMap[countryName] || '🌍';
};

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

const ScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <p className="label" style={{fontSize: '1.05rem'}}>
          {getFlagEmoji(data.country)} {data.country}
        </p>
        <p style={{ color: '#0ea5e9' }}>Streams: {formatWithCommas(data.streams)}</p>
        <p style={{ color: '#ec4899' }}>Listeners: {formatWithCommas(data.listeners)}</p>
        <p style={{ color: 'var(--color-text-muted)' }}>Artists: {data.artistCount}</p>
      </div>
    );
  }
  return null;
};

export default function Countries() {
  const { data: rawData, loading, error } = useFetch('/api/countries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryObj, setSelectedCountryObj] = useState(null); // Used for Modal

  // --- Client-side aggregation mapping ---
  // The rawData is a flat array of artists per country. We need to aggregate it.
  const aggregatedCountries = useMemo(() => {
    if (!rawData) return [];
    
    const countryMap = rawData.reduce((acc, curr) => {
      const c = curr.country || 'Unknown';
      if (!acc[c]) {
        acc[c] = {
          country: c,
          artistCount: 0,
          totalStreams: 0,
          totalListeners: 0,
          genres: {},
          topArtist: { name: '', streams: 0 },
          artistsList: [] // For the modal
        };
      }
      
      const streams = curr.streams || 0;
      const listeners = curr.listeners || 0;
      const genre = curr.genre || 'Unknown';
      
      acc[c].artistCount += 1;
      acc[c].totalStreams += streams;
      acc[c].totalListeners += listeners;
      
      // Track genres
      acc[c].genres[genre] = (acc[c].genres[genre] || 0) + 1;
      
      // Track top artist
      if (streams > acc[c].topArtist.streams) {
        acc[c].topArtist = { name: curr.artist_name, streams };
      }
      
      // Save for modal
      acc[c].artistsList.push(curr);
      
      return acc;
    }, {});

    // Convert to array and determine top genre
    return Object.values(countryMap).map(cData => {
      const topGenre = Object.entries(cData.genres).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      return { ...cData, topGenre };
    });
  }, [rawData]);

  // Apply Search
  const displayCountries = useMemo(() => {
    return aggregatedCountries.filter(c => c.country.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [aggregatedCountries, searchTerm]);


  // --- Derived Datasets for Charts ---

  // Chart 1: Number of Artists per Country (Top 15)
  const artistCountData = useMemo(() => {
    return [...displayCountries]
      .sort((a, b) => b.artistCount - a.artistCount)
      .slice(0, 15);
  }, [displayCountries]);

  // Chart 2: Total Streams per Country (Top 15)
  const streamCountData = useMemo(() => {
    return [...displayCountries]
      .sort((a, b) => b.totalStreams - a.totalStreams)
      .slice(0, 15);
  }, [displayCountries]);

  // Chart 3: Genre Diversity by Country (Stacked, Top 8)
  const genreDiversityData = useMemo(() => {
    const top8 = [...displayCountries].sort((a, b) => b.artistCount - a.artistCount).slice(0, 8);
    // Determine the top unique genres across these 8 countries to use as stack keys
    const uniqueGenres = new Set();
    top8.forEach(c => Object.keys(c.genres).forEach(g => uniqueGenres.add(g)));
    const stackKeys = Array.from(uniqueGenres).slice(0, 8); // Keep legend manageable

    return {
      data: top8.map(c => {
        const row = { country: c.country };
        stackKeys.forEach(g => {
          row[g] = c.genres[g] || 0;
        });
        return row;
      }),
      keys: stackKeys
    };
  }, [displayCountries]);

  // Chart 4: Listeners vs Streams Scatter
  const scatterData = useMemo(() => {
     return [...displayCountries].filter(c => c.totalStreams > 0 && c.totalListeners > 0);
  }, [displayCountries]);


  if (loading) return <Loader />;
  if (error) return <div className="page-container"><p style={{ color: 'var(--color-text-secondary)' }}>Error: {error}</p></div>;

  // --- Modal Config ---
  const modalColumns = [
    { key: 'artist_name', label: 'Artist Name', render: (val) => <strong style={{color: 'var(--color-text-primary)'}}>{val}</strong> },
    { key: 'genre', label: 'Genre' },
    { key: 'streams', label: 'Global Streams', render: (val) => formatWithCommas(val) },
    { key: 'listeners', label: 'Global Listeners', render: (val) => formatWithCommas(val) }
  ];

  return (
    <div className="animate-fade-in-up" style={{ position: 'relative' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Global Cultural Imprints</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Explore where the world's most streamed artists originate.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ background: 'var(--color-bg-card)', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', width: '100%', maxWidth: '350px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <IoSearchOutline style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search countries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%' }}
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

        {/* Chart 1: Artists per Country */}
        <div className="grid-item-full">
          <ChartCard title="Number of Artists per Country">
             <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={artistCountData} margin={{ left: 0, right: 30, top: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="country" stroke="var(--color-text-muted)" angle={-45} textAnchor="end" tick={{fontSize: 11}} tickFormatter={(val) => `${getFlagEmoji(val)} ${val}`} />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="artistCount" name="Exported Artists" radius={[4, 4, 0, 0]} animationDuration={1000}>
                     {artistCountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Total Streams per Country */}
        <div className="grid-item-full">
          <ChartCard title="Total Cumulative Streams Originating by Country">
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={streamCountData} margin={{ left: 100, right: 30, top: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorStreamGreen" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => formatCompactNumber(val)} />
                  <YAxis dataKey="country" type="category" stroke="var(--color-text-muted)" width={90} tick={{fontSize: 11}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                  <Bar dataKey="totalStreams" name="Origin Streams" fill="url(#colorStreamGreen)" radius={[0, 4, 4, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 3: Genre Diversity */}
        <div className="grid-item-full">
          <ChartCard title="Genre Diversity Profile (Top 8)">
             <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={genreDiversityData.data} margin={{ left: 0, right: 30, top: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="country" stroke="var(--color-text-muted)" angle={-45} textAnchor="end" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip cursor={{fill: 'var(--color-bg-card-hover)'}} contentStyle={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '0.8rem', paddingTop: '10px'}} />
                  {genreDiversityData.keys.map((genreKey, index) => (
                    <Bar key={genreKey} dataKey={genreKey} stackId="a" fill={colorPalette[index % colorPalette.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 4: Listeners vs Streams Scatter */}
        <div className="grid-item-full">
          <ChartCard title="Listeners vs Streams Influence Map">
             <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" dataKey="totalListeners" name="Listeners" stroke="var(--color-text-muted)" tickFormatter={(val) => formatCompactNumber(val)} />
                  <YAxis type="number" dataKey="totalStreams" name="Streams" stroke="var(--color-text-muted)" tickFormatter={(val) => formatCompactNumber(val)} />
                  <ZAxis type="number" dataKey="artistCount" range={[100, 2000]} name="Artists" />
                  <Tooltip content={<ScatterTooltip />} cursor={{strokeDasharray: '3 3'}} />
                  <Scatter name="Countries" data={scatterData} fill="#ec4899" fillOpacity={0.7} animationDuration={1500} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

      </div>

      {/* Country Cards Grid */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
        Export Profiles ({displayCountries.length})
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {displayCountries.map(country => (
          <div 
            key={country.country}
            onClick={() => setSelectedCountryObj(country)}
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.15)';
            }}
            onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.borderColor = 'var(--color-border)';
               e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
               <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1.5rem' }}>{getFlagEmoji(country.country)}</span> {country.country}
               </h4>
               <span style={{ fontSize: '0.85rem', background: 'var(--color-bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'var(--color-text-muted)' }}>
                 {country.artistCount} Artists
               </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Streams:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{formatCompactNumber(country.totalStreams)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Listeners:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{formatCompactNumber(country.totalListeners)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Dominant Genre:</span>
                <span style={{ color: '#0ea5e9', fontWeight: 500 }}>{country.topGenre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Top Artist:</span>
                <span style={{ color: '#ec4899', fontWeight: 500 }}>{country.topArtist.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal View */}
      {selectedCountryObj && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="animate-fade-in-up" style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>
                 {getFlagEmoji(selectedCountryObj.country)} {selectedCountryObj.country} Roster
               </h2>
               <button 
                 onClick={() => setSelectedCountryObj(null)}
                 style={{ background: 'var(--color-bg-secondary)', border: 'none', color: 'var(--color-text-primary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
               >
                 <IoCloseOutline size={24} />
               </button>
            </div>
            
            {/* Modal Body: DataTable uses internal scroll if needed */}
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
               <DataTable columns={modalColumns} data={selectedCountryObj.artistsList} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
