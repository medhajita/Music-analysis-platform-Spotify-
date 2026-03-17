import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

import { 
  CHART_COLORS, 
  ChartCard, 
  CustomTooltip, 
  COMMON_CHART_PROPS, 
  COMMON_LEGEND_PROPS 
} from '../../config/charts';

const GenrePieChart = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.genre,
    value: item.count
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text 
        x={x} 
        y={y} 
        fill="#B3B3B3" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-[10px] font-bold uppercase tracking-tighter"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard 
      title="Répartition par Genre" 
      subtitle="Distribution des artistes par catégorie musicale"
      data={chartData}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart {...COMMON_CHART_PROPS}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
            label={renderCustomizedLabel}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
             {...COMMON_LEGEND_PROPS}
             verticalAlign="bottom" 
             align="center"
             iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GenrePieChart;
