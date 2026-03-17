import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { 
  CHART_COLORS, 
  ChartCard, 
  CustomTooltip, 
  COMMON_CHART_PROPS, 
  COMMON_AXIS_PROPS, 
  COMMON_GRID_PROPS,
  formatNumber,
  numberTickFormatter
} from '../../config/charts';

const FollowersRangeHistogram = ({ artists }) => {
  // Define ranges
  const ranges = [
    { name: 'Micro (0-1M)', min: 0, max: 1000000, count: 0 },
    { name: 'Mid (1M-5M)', min: 1000000, max: 5000000, count: 0 },
    { name: 'Major (5M-20M)', min: 5000000, max: 20000000, count: 0 },
    { name: 'Superstar (20M+)', min: 20000000, max: Infinity, count: 0 },
  ];

  artists.forEach(artist => {
    const followers = artist.followers || 0;
    const range = ranges.find(r => followers >= r.min && followers < r.max);
    if (range) range.count++;
  });

  const chartData = ranges.map(r => ({ ...r, value: r.count }));

  return (
    <ChartCard 
      title="Segments d'Audience" 
      subtitle="Répartition des artistes par volume de followers"
      data={chartData}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} {...COMMON_CHART_PROPS}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis 
            dataKey="name" 
            {...COMMON_AXIS_PROPS}
            tickFormatter={(val) => val.split(' ')[0]}
          />
          <YAxis 
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default FollowersRangeHistogram;
