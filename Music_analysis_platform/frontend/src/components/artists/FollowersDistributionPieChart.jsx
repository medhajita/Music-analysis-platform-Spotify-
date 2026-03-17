import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

import { 
  CHART_COLORS, 
  ChartCard, 
  CustomTooltip, 
  formatNumber
} from '../../config/charts';

const FollowersDistributionPieChart = ({ artists }) => {
  const chartData = useMemo(() => {
    if (!artists || artists.length === 0) return [];

    // Define follower ranges with better labels
    const ranges = [
      { 
        name: 'Artistes Émergents', 
        range: '0-1M followers',
        min: 0, 
        max: 1000000, 
        count: 0,
        percentage: 0,
        description: 'Moins de 1 million'
      },
      { 
        name: 'Artistes Établis', 
        range: '1M-5M followers',
        min: 1000000, 
        max: 5000000, 
        count: 0,
        percentage: 0,
        description: '1 à 5 millions'
      },
      { 
        name: 'Artistes Populaires', 
        range: '5M-20M followers',
        min: 5000000, 
        max: 20000000, 
        count: 0,
        percentage: 0,
        description: '5 à 20 millions'
      },
      { 
        name: 'Superstars', 
        range: '20M+ followers',
        min: 20000000, 
        max: Infinity, 
        count: 0,
        percentage: 0,
        description: 'Plus de 20 millions'
      },
    ];

    // Count artists in each range
    artists.forEach(artist => {
      const followers = artist.followers || 0;
      const range = ranges.find(r => followers >= r.min && followers < r.max);
      if (range) range.count++;
    });

    // Calculate percentages
    const total = artists.length;
    ranges.forEach(range => {
      range.percentage = total > 0 ? (range.count / total) * 100 : 0;
    });

    // Filter out empty ranges
    return ranges.filter(r => r.count > 0);
  }, [artists]);

  const CustomTooltipContent = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold text-sm">{data.name}</p>
          <p className="text-slate-300 text-xs">{data.description}</p>
          <p className="text-emerald-400 font-bold text-sm mt-1">
            {data.count} artistes ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  if (!chartData || chartData.length === 0) {
    return (
      <ChartCard 
        title="Répartition des Artistes par Followers" 
        subtitle="Distribution des volumes d'audience"
        height={300}
      >
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
          Aucune donnée disponible
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard 
      title="Répartition des Artistes par Followers" 
      subtitle="Distribution des volumes d'audience par catégorie"
      data={chartData}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltipContent />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span className="text-xs text-slate-300">
                {value} ({entry.payload.count})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-slate-400 text-xs uppercase tracking-wide">Total Artistes</p>
          <p className="text-white font-bold text-lg">{artists.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-slate-400 text-xs uppercase tracking-wide">Catégories</p>
          <p className="text-white font-bold text-lg">{chartData.length}</p>
        </div>
      </div>
    </ChartCard>
  );
};

export default FollowersDistributionPieChart;
