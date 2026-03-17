import React, { useMemo } from 'react';
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

const TopCountriesBarChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .slice(0, 15)
      .map(item => ({
        name: item.country,
        value: Number(item.artists_count || 0)
      }));
  }, [data]);

  return (
    <ChartCard 
      title="Top 15 Marchés (Artistes)" 
      subtitle="Nombre d'artistes originaires par territoire"
      data={chartData}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 20 }}
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                fillOpacity={1 - (index * 0.03)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopCountriesBarChart;
