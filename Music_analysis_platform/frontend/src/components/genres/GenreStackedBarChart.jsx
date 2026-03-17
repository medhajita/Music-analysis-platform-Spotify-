import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
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

const GenreStackedBarChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .map(item => ({
        name: item.genre,
        'Streams Artistes': Number(item.total_artist_streams),
        'Streams Albums': Number(item.total_album_streams),
        'Streams Titres': Number(item.total_song_streams),
        total: Number(item.total_artist_streams) + Number(item.total_album_streams) + Number(item.total_song_streams)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [data]);

  return (
    <ChartCard 
      title="Architecture des Flux" 
      subtitle="Décomposition par type de source (Top 7 Genres)"
      data={chartData}
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, bottom: 40 }}
        >
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis 
            dataKey="name" 
            {...COMMON_AXIS_PROPS}
            angle={-25} 
            textAnchor="end" 
            interval={0}
            height={60}
          />
          <YAxis 
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend {...COMMON_LEGEND_PROPS} verticalAlign="top" align="right" />
          <Bar dataKey="Streams Artistes" stackId="a" fill={THREE_SERIES_COLORS.primary} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Streams Albums" stackId="a" fill={THREE_SERIES_COLORS.secondary} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Streams Titres" stackId="a" fill={THREE_SERIES_COLORS.tertiary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GenreStackedBarChart;
