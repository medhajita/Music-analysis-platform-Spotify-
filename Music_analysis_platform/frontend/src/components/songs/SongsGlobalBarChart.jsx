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

const SongsGlobalBarChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .slice(0, 15)
      .map(song => ({
        name: song.song_title || song.song || 'Unknown',
        artist: song.artist || 'Unknown',
        streams: Number(song.total_global || song.streams_songs || 0),
        reach: Number(song.countries_count || 1)
      }));
  }, [data]);

  const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <ChartCard 
      title="Performance Globale vs Portée" 
      subtitle="Comparaison des streams totaux et du nombre de pays touchés (Top 15)"
      data={chartData}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          {...COMMON_CHART_PROPS}
          barGap={4}
        >
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            interval={0}
            height={80}
            {...COMMON_AXIS_PROPS}
            tickFormatter={(val) => truncate(val, 15)}
          />
          <YAxis 
            yAxisId="left"
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
            stroke={THREE_SERIES_COLORS.primary}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            {...COMMON_AXIS_PROPS}
            stroke={THREE_SERIES_COLORS.secondary}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend {...COMMON_LEGEND_PROPS} verticalAlign="top" align="right" />
          <Bar 
            yAxisId="left"
            name="Streams Globaux" 
            dataKey="streams" 
            fill={THREE_SERIES_COLORS.primary} 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            yAxisId="right"
            name="Reach (Pays)" 
            dataKey="reach" 
            fill={THREE_SERIES_COLORS.secondary} 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SongsGlobalBarChart;
