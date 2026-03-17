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
  numberTickFormatter
} from '../../config/charts';

const TopStreamsBarChart = ({ data }) => {
  const chartData = data.map(item => ({
    ...item,
    name: item.artist,
    value: item.total_streams
  }));

  const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <ChartCard 
      title="Top 10 Artistes (en streams)" 
      subtitle="Performance cumulée sur toutes ses sorties"
      data={chartData}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 60 }}
        >
          <CartesianGrid {...COMMON_GRID_PROPS} horizontal={true} />
          <XAxis 
            type="number" 
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            {...COMMON_AXIS_PROPS}
            width={100}
            tickFormatter={(value) => truncate(value, 20)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                fillOpacity={1 - index * 0.05} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopStreamsBarChart;
