import React from 'react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatsGrid from '../components/home/StatsGrid';
import TopStreamsBarChart from '../components/home/TopStreamsBarChart';
import GenrePieChart from '../components/home/GenrePieChart';
import { LayoutGrid } from 'lucide-react';

const HomePage = () => {
  const { data: stats, loading, error } = useApi('/stats');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">🎵 Dashboard Global</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Analyse statistique de la plateforme musicale Spotify
        </p>
      </header>

      {/* KPI Cards */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <LayoutGrid size={18} />
          <h2 className="uppercase text-xs font-bold tracking-widest letter">Indicateurs clés</h2>
        </div>
        <StatsGrid stats={stats.kpis} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopStreamsBarChart data={stats.charts.top_artists} />
        <GenrePieChart data={stats.charts.genres} />
      </div>
    </div>
  );
};

export default HomePage;
