import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';
import useFetch from '../hooks/useFetch';
import ChartCard from '../components/ChartCard';
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

export default function Genres() {
  const { data: genresRaw, loading: loadingGenres, error: errorGenres } = useFetch('/api/genres');
  const { data: trendRaw, loading: loadingTrend, error: errorTrend } = useFetch('/api/genres/yearly-trend');
  const [selectedGenre, setSelectedGenre] = useState(null);

  // --- Computed data ---
  const genres = useMemo(() => genresRaw || [], [genresRaw]);

  const maxStreams = useMemo(() => {
    if (!genres.length) return 1;
    return Math.max(...genres.map(g => g.totalStreams));
  }, [genres]);

  // For Donut PieChart — show top 12 to keep it readable
  const pieData = useMemo(() => {
    const source = selectedGenre ? genres.filter(g => g.genre === selectedGenre) : genres;
    return source.slice(0, 12).map(g => ({ name: g.genre, value: g.totalStreams }));
  }, [genres, selectedGenre]);

  // For Grouped BarChart — top 8 genres
  const groupedBarData = useMemo(() => {
    const source = selectedGenre ? genres.filter(g => g.genre === selectedGenre) : genres;
    return source.slice(0, 8);
  }, [genres, selectedGenre]);

  // For RadarChart — normalize across metrics for top 6 genres
  const radarData = useMemo(() => {
    const source = selectedGenre ? genres.filter(g => g.genre === selectedGenre) : genres;
    const top = source.slice(0, 6);
    if (!top.length) return [];

    // Create axes: one per metric
    const metrics = ['totalStreams', 'artistCount', 'songCount', 'albumCount', 'totalListeners'];
    const metricLabels = { totalStreams: 'Streams', artistCount: 'Artists', songCount: 'Songs', albumCount: 'Albums', totalListeners: 'Listeners' };

    // Normalize each metric to 0-100 scale
    const maxVals = {};
    metrics.forEach(m => {
      maxVals[m] = Math.max(...top.map(g => g[m] || 0), 1);
    });

    return metrics.map(m => {
      const row = { metric: metricLabels[m] };
      top.forEach(g => {
        row[g.genre] = Math.round(((g[m] || 0) / maxVals[m]) * 100);
      });
      return row;
    });
  }, [genres, selectedGenre]);

  const radarGenreKeys = useMemo(() => {
    const source = selectedGenre ? genres.filter(g => g.genre === selectedGenre) : genres;
    return source.slice(0, 6).map(g => g.genre);
  }, [genres, selectedGenre]);

  // For Stacked AreaChart — genre trends over years
  const areaData = useMemo(() => {
    if (!trendRaw) return { data: [], keys: [] };

    const source = selectedGenre
      ? trendRaw.filter(r => r.genre === selectedGenre)
      : trendRaw;

    // Get top genres by total count
    const genreTotals = {};
    source.forEach(r => {
      genreTotals[r.genre] = (genreTotals[r.genre] || 0) + r.count;
    });
    const topGenres = Object.entries(genreTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([g]) => g);

    // Build year-keyed rows
    const yearMap = {};
    source.filter(r => topGenres.includes(r.genre)).forEach(r => {
      if (!yearMap[r.year]) yearMap[r.year] = { year: String(r.year) };
      yearMap[r.year][r.genre] = (yearMap[r.year][r.genre] || 0) + r.count;
    });

    const data = Object.values(yearMap).sort((a, b) => a.year.localeCompare(b.year));
    return { data, keys: topGenres };
  }, [trendRaw, selectedGenre]);

  if (loadingGenres || loadingTrend) return <Loader />;
  if (errorGenres || errorTrend) return <div className="page-container"><p style={{ color: 'var(--color-text-secondary)' }}>Error loading genre data.</p></div>;

  const handleGenreClick = (genre) => {
    setSelectedGenre(prev => prev === genre ? null : genre);
  };

  // Area gradient colors per genre
  const areaColors = ['#a855f7', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="animate-fade-in-up">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Genre Analytics</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Dive deep into the musical DNA of {genres.length} genres across the Spotify ecosystem.
          </p>
        </div>
        {selectedGenre && (
          <button
            onClick={() => setSelectedGenre(null)}
            style={{
              background: 'var(--color-accent)', color: '#fff', border: 'none',
              padding: '0.5rem 1.25rem', borderRadius: '2rem', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600,
              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.4)'
            }}
          >
            ✕ Clear Filter: {selectedGenre}
          </button>
        )}
      </header>

      {/* 4 Charts Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 1400px) {
            .grid-item-full { grid-column: 1 / -1; }
          }
        `}} />

        {/* Chart 1: Donut PieChart */}
        <div className="grid-item-full">
          <ChartCard title="Total Streams per Genre">
            <div style={{ height: 380, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }} />
                  <Pie
                    data={pieData}
                    cx="40%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={1500}
                    stroke="var(--color-bg-card)"
                    strokeWidth={2}
                    onClick={(entry) => handleGenreClick(entry.name)}
                    style={{ cursor: 'pointer' }}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      if (percent < 0.04) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 20;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="var(--color-text-secondary)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11">
                          {name} ({(percent * 100).toFixed(0)}%)
                        </text>
                      );
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colorPalette[index % colorPalette.length]}
                        opacity={selectedGenre && entry.name !== selectedGenre ? 0.3 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 2: Grouped BarChart */}
        <div className="grid-item-full">
          <ChartCard title="Genre Popularity: Artists vs Songs vs Albums">
            <div style={{ height: 380, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={groupedBarData} margin={{ left: 0, right: 20, top: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="genre" stroke="var(--color-text-muted)" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-card-hover)' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="artistCount" name="Artists" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="songCount" name="Songs" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="albumCount" name="Albums" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 3: RadarChart */}
        <div className="grid-item-full">
          <ChartCard title="Genre Metrics Radar Comparison">
            <div style={{ height: 380, width: '100%' }}>
              <ResponsiveContainer>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="metric" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {radarGenreKeys.map((genre, index) => (
                    <Radar
                      key={genre}
                      name={genre}
                      dataKey={genre}
                      stroke={colorPalette[index % colorPalette.length]}
                      fill={colorPalette[index % colorPalette.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart 4: Stacked AreaChart */}
        <div className="grid-item-full">
          <ChartCard title="Genre Release Year Trends">
            <div style={{ height: 380, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={areaData.data} margin={{ left: 0, right: 30, top: 20, bottom: 5 }}>
                  <defs>
                    {areaData.keys.map((genre, index) => (
                      <linearGradient key={genre} id={`areaColor-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={areaColors[index % areaColors.length]} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={areaColors[index % areaColors.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} minTickGap={10} />
                  <YAxis stroke="var(--color-text-muted)" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                  {areaData.keys.map((genre, index) => (
                    <Area
                      key={genre}
                      type="monotone"
                      dataKey={genre}
                      stackId="1"
                      stroke={areaColors[index % areaColors.length]}
                      fill={`url(#areaColor-${index})`}
                      strokeWidth={2}
                      animationDuration={1500}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Genre Cards Grid */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
        All Genres ({genres.length})
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {genres.map((g, idx) => {
          const isActive = selectedGenre === g.genre;
          const sharePercent = maxStreams > 0 ? ((g.totalStreams / maxStreams) * 100).toFixed(1) : 0;

          return (
            <div
              key={g.genre}
              onClick={() => handleGenreClick(g.genre)}
              style={{
                background: isActive ? 'var(--color-bg-card-hover)' : 'var(--color-bg-card)',
                border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '0.75rem',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }
              }}
            >
              {/* Genre Name + Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {g.genre}
                </h4>
                <span style={{
                  background: colorPalette[idx % colorPalette.length],
                  color: '#fff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  #{idx + 1}
                </span>
              </div>

              {/* Key Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Streams</span>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{formatCompactNumber(g.totalStreams)}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Artists</span>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{g.artistCount}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Songs</span>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{g.songCount}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Albums</span>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{g.albumCount}</p>
                </div>
              </div>

              {/* Mini Sparkline Bar — relative stream share */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  <span>Stream Share</span>
                  <span>{sharePercent}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${sharePercent}%`,
                    height: '100%',
                    background: `linear-gradient(to right, ${colorPalette[idx % colorPalette.length]}, ${colorPalette[(idx + 1) % colorPalette.length]})`,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'var(--color-accent)'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
