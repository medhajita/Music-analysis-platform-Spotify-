import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

import { 
  THREE_SERIES_COLORS, 
  ChartCard, 
  CustomTooltip, 
  COMMON_CHART_PROPS, 
  COMMON_AXIS_PROPS, 
  COMMON_GRID_PROPS,
  COMMON_LEGEND_PROPS,
  numberTickFormatter
} from '../../config/charts';

const CountryStatsGroupedBarChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .slice(0, 10)
      .map(item => ({
        name: item.country,
        Artistes: Number(item.artists_count || 0),
        Albums: Number(item.albums_count || 0),
        Chansons: Number(item.total_songs_count || 0)
      }));
  }, [data]);

  return (
    <ChartCard 
      title="Profil des Marchés" 
      subtitle="Répartition des catalogues (Artistes / Albums / Titres)"
      data={chartData}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} {...COMMON_CHART_PROPS}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis 
            dataKey="name" 
            {...COMMON_AXIS_PROPS}
            tick={{ fill: '#888', fontSize: 9, fontWeight: 'bold' }}
          />
          <YAxis 
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend {...COMMON_LEGEND_PROPS} verticalAlign="top" align="right" />
          <Bar dataKey="Artistes" fill={THREE_SERIES_COLORS.primary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Albums" fill={THREE_SERIES_COLORS.secondary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Chansons" fill={THREE_SERIES_COLORS.tertiary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default CountryStatsGroupedBarChart;
