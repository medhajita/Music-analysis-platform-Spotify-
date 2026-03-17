import React from 'react';
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
  TWO_SERIES_COLORS, 
  ChartCard, 
  CustomTooltip, 
  COMMON_CHART_PROPS, 
  COMMON_AXIS_PROPS, 
  COMMON_GRID_PROPS,
  COMMON_LEGEND_PROPS,
  numberTickFormatter
} from '../../config/charts';

const GainsComparisonChart = ({ data }) => {
  const chartData = data.slice(0, 15).map(album => ({
    name: album.album_title,
    weekly: album.weekly_gain_streams_albums,
    monthly: album.monthly_gain_streams_albums
  }));

  const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <ChartCard 
      title="Croissance des Streams" 
      subtitle="Comparaison des gains hebdomadaires vs mensuels (Top 15)"
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
            {...COMMON_AXIS_PROPS} 
            tickFormatter={numberTickFormatter} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend {...COMMON_LEGEND_PROPS} verticalAlign="top" align="right" />
          <Bar name="Gain Hebdo" dataKey="weekly" fill={TWO_SERIES_COLORS.primary} radius={[4, 4, 0, 0]} />
          <Bar name="Gain Mensuel" dataKey="monthly" fill={TWO_SERIES_COLORS.secondary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GainsComparisonChart;
