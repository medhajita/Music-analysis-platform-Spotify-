import React from 'react';
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
  TWO_SERIES_COLORS, 
  ChartCard, 
  CustomTooltip, 
  COMMON_CHART_PROPS, 
  COMMON_AXIS_PROPS, 
  COMMON_GRID_PROPS,
  COMMON_LEGEND_PROPS,
  numberTickFormatter
} from '../../config/charts';

const FollowersStreamsBarChart = ({ data }) => {
  const chartData = data.slice(0, 15).map(artist => ({
    name: artist.artist,
    followers: artist.followers,
    streams: artist.total_streams,
  }));

  return (
    <ChartCard 
      title="Corrélation Followers VS Streams" 
      subtitle="Comparaison directe de l'audience et du volume d'écoute (Top 15)"
      data={chartData}
      height={350}
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
            height={60}
            {...COMMON_AXIS_PROPS}
          />
          <YAxis 
            tickFormatter={numberTickFormatter}
            {...COMMON_AXIS_PROPS}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend 
            {...COMMON_LEGEND_PROPS}
            verticalAlign="top" 
            align="right" 
          />
          <Bar 
            name="Followers" 
            dataKey="followers" 
            fill={TWO_SERIES_COLORS.primary} 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            name="Streams Total" 
            dataKey="streams" 
            fill={TWO_SERIES_COLORS.secondary} 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default FollowersStreamsBarChart;
