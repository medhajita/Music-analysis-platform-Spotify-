import React from 'react';
import { 
  Users, 
  Disc, 
  Music, 
  Activity, 
  Globe, 
  Tag, 
  Star, 
  TrendingUp, 
  Award, 
  BarChart
} from 'lucide-react';
import { formatNumber } from '../../utils/format';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white dark:bg-black/40 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-2 truncate max-w-[150px]">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </div>
);

const StatsGrid = ({ stats }) => {
  const kpiData = [
    { title: 'Total Artistes', value: formatNumber(stats.total_artists), icon: Users, color: 'bg-green-500 text-green-500', subtitle: 'Artistes dans la base' },
    { title: 'Total Albums', value: formatNumber(stats.total_albums), icon: Disc, color: 'bg-blue-500 text-blue-500', subtitle: 'Albums les plus streamés' },
    { title: 'Total Chansons', value: formatNumber(stats.total_songs), icon: Music, color: 'bg-purple-500 text-purple-500', subtitle: 'Titres uniques' },
    { title: 'Total Streams', value: formatNumber(stats.total_streams), icon: Activity, color: 'bg-primary-light text-primary-light', subtitle: 'Écoutes cumulées' },
    { title: 'Pays Couverts', value: stats.total_countries, icon: Globe, color: 'bg-yellow-500 text-yellow-500', subtitle: 'Origines géographiques' },
    { title: 'Genres Musicaux', value: stats.total_genres, icon: Tag, color: 'bg-pink-500 text-pink-500', subtitle: 'Tags distincts' },
    { title: 'Top Artiste', value: stats.top_artist?.artist || 'N/A', icon: Star, color: 'bg-amber-400 text-amber-400', subtitle: `${formatNumber(stats.top_artist?.total_streams)} streams` },
    { title: 'Top Album', value: stats.top_album?.album_title || 'N/A', icon: Award, color: 'bg-indigo-500 text-indigo-500', subtitle: `${formatNumber(stats.top_album?.streams_albums)} streams` },
    { title: 'Followers Moy.', value: formatNumber(stats.avg_followers), icon: TrendingUp, color: 'bg-cyan-500 text-cyan-500', subtitle: 'Par artiste' },
    { title: 'Clubs des 1B', value: stats.artists_with_1B, icon: BarChart, color: 'bg-emerald-500 text-emerald-500', subtitle: 'Artistes > 1Md streams' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiData.map((kpi, idx) => (
        <StatCard key={idx} {...kpi} />
      ))}
    </div>
  );
};

export default StatsGrid;
