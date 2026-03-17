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

const FollowersHistogram = ({ data }) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binCount = 12; // Adjusted to match CHART_COLORS length
  const binWidth = (max - min) / binCount;
  
  const bins = Array.from({ length: binCount }, (_, i) => ({
    name: `${formatNumber(min + i * binWidth)} – ${formatNumber(min + (i + 1) * binWidth)}`,
    range: `${formatNumber(min + i * binWidth)}`,
    count: 0,
    value: 0 // Will store count for Tooltip
  }));

  data.forEach(val => {
    const binIdx = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
    bins[binIdx].count++;
    bins[binIdx].value++;
  });

  return (
    <ChartCard 
      title="Distribution des Followers" 
      subtitle="Nombre d'artistes par tranche d'audience"
      data={bins}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} {...COMMON_CHART_PROPS}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis 
            dataKey="range" 
            {...COMMON_AXIS_PROPS}
            interval={1}
          />
          <YAxis 
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
          />
          <Tooltip 
            content={<CustomTooltip formatter={(label) => `Tranche: ${label}`} />} 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {bins.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default FollowersHistogram;
