import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  CHART_COLORS,
  ChartCard,
  CustomTooltip
} from '../../config/charts';

const StreamsDistributionByGenreChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data]
      .filter((item) => item.genre)
      .map((item) => ({
        genre: item.genre,
        streams: Number(item.total_streams || 0)
      }))
      .sort((a, b) => b.streams - a.streams);
  }, [data]);

  return (
    <ChartCard
      title="Streams Distribution by Genre"
      subtitle="From most_streamed_songs grouped by genre"
      data={chartData}
      height={360}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="streams"
            nameKey="genre"
            cx="50%"
            cy="48%"
            outerRadius={110}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`${entry.genre}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default StreamsDistributionByGenreChart;
