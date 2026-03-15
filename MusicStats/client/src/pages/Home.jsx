import { useMemo } from 'react';
import {
  IoPeople, IoMusicalNotes, IoDisc, IoGrid,
  IoGlobe, IoPlay, IoHeart, IoHeadset
} from 'react-icons/io5';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import AnimatedNumber from '../components/AnimatedNumber';
import useFetch from '../hooks/useFetch';
import colorPalette from '../utils/colorPalette';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        {label && <p className="label">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.fill || 'var(--color-text-primary)' }}>
            {entry.name}: {Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Home() {
  const { data, loading, error } = useFetch('/api/stats/overview');

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="page-container"><p style={{ color: 'var(--color-text-secondary)' }}>Error loading dashboard: {error}</p></div>;
  if (!data) return null;

  const { metrics, charts } = data;

  return (
    <div className="animate-fade-in-up">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ 
          background: 'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🎵 Global Music Statistics
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Overview of key platform metrics. Last updated: {today}
        </p>
      </header>

      {/* Top Row: 8 StatCards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard icon={<IoPeople />} label="Total Artists" value={<AnimatedNumber value={metrics.totalArtists} />} />
        <StatCard icon={<IoMusicalNotes />} label="Total Songs" value={<AnimatedNumber value={metrics.totalSongs} />} />
        <StatCard icon={<IoDisc />} label="Total Albums" value={<AnimatedNumber value={metrics.totalAlbums} />} />
        <StatCard icon={<IoGrid />} label="Genres Analyzed" value={<AnimatedNumber value={metrics.totalGenres} />} />
        <StatCard icon={<IoGlobe />} label="Countries Represented" value={<AnimatedNumber value={metrics.totalCountries} />} />
        <StatCard icon={<IoPlay />} label="Global Streams" value={<AnimatedNumber value={metrics.totalStreams} />} />
        <StatCard icon={<IoHeart />} label="Total Followers" value={<AnimatedNumber value={metrics.totalFollowers} />} />
        <StatCard icon={<IoHeadset />} label="Total Listeners" value={<AnimatedNumber value={metrics.totalListeners} />} />
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 1100px) {
            .charts-grid-row { grid-template-columns: 1fr !important; }
          }
        `}} />

        {/* Chart 1: Top Artists (Horizontal Bar) */}
        <ChartCard title="Top 10 Most Streamed Artists">
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={charts.topArtistsByStreams}
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorStreams" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-gradient-start)" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="var(--color-gradient-end)" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="var(--color-text-muted)" tickFormatter={(val) => (val/1e9).toFixed(1)+'B'} />
                <YAxis dataKey="artist_name" type="category" stroke="var(--color-text-muted)" width={80} tick={{fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                <Bar dataKey="streams" name="Streams" fill="url(#colorStreams)" radius={[0, 4, 4, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Streams by Genre (Pie) */}
        <ChartCard title="Streams Distribution by Genre">
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px', color: 'var(--color-text-secondary)' }} />
                <Pie
                  data={charts.genreDistribution.map(d => ({ ...d, value: Number(d.value) }))}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  animationDuration={1500}
                  stroke="var(--color-bg-card)"
                  strokeWidth={2}
                >
                  {charts.genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 3: Top Countries (Vertical Bar) */}
        <ChartCard title="Top Countries by Artist Count">
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart
                data={charts.topCountries}
                margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="colorCountry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="country" stroke="var(--color-text-muted)" angle={-45} textAnchor="end" tick={{fontSize: 12}} />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-bg-card-hover)'}} />
                <Bar dataKey="artist_count" name="Artists" fill="url(#colorCountry)" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 4: Followers vs Listeners (Scatter) */}
        <ChartCard title="Followers vs Listeners Correlation">
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 40, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  type="number" 
                  dataKey="followers" 
                  name="Followers" 
                  stroke="var(--color-text-muted)"
                  tickFormatter={(val) => (val/1e6).toFixed(0)+'M'}
                  label={{ value: 'Followers', position: 'insideBottom', offset: -15, fill: 'var(--color-text-muted)' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="listeners" 
                  name="Listeners" 
                  stroke="var(--color-text-muted)"
                  tickFormatter={(val) => (val/1e6).toFixed(0)+'M'}
                  label={{ value: 'Listeners', angle: -90, position: 'insideLeft', offset: -15, fill: 'var(--color-text-muted)' }}
                />
                <ZAxis type="category" dataKey="artist_name" name="Artist" />
                <Tooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3', stroke: 'var(--color-text-muted)'}} />
                <Scatter name="Artists" data={charts.followersVsListeners} fill="var(--color-gradient-end)" animationDuration={1500}>
                  {charts.followersVsListeners.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorPalette[(index * 3) % colorPalette.length]} opacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
