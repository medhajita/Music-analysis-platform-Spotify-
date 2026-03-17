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

const TopGenresBarChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .map(item => ({
        name: item.genre,
        value: Number(item.total_artist_streams) + Number(item.total_album_streams) + Number(item.total_song_streams)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  return (
    <ChartCard 
      title="Performance par Genre" 
      subtitle="Volume total des streams cumulés (Top 10)"
      data={chartData}
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 10 }}
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
            width={85}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                fillOpacity={1 - (index * 0.04)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopGenresBarChart;
