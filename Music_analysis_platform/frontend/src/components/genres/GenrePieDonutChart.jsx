import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { 
  CHART_COLORS, 
  ChartCard, 
  CustomTooltip,
  COMMON_LEGEND_PROPS
} from '../../config/charts';

const GenrePieDonutChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => b.artists_count - a.artists_count)
      .slice(0, 8)
      .map(item => ({
        name: item.genre,
        value: Number(item.artists_count)
      }));
  }, [data]);

  return (
    <ChartCard 
      title="Concentration d'Artistes" 
      subtitle="Répartition des 8 genres les plus prolifiques"
      data={chartData}
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            {...COMMON_LEGEND_PROPS}
            verticalAlign="bottom" 
            align="center" 
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GenrePieDonutChart;
