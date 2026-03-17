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
  COMMON_GRID_PROPS
} from '../../config/charts';

const GenreSongCountChart = ({ data, countryLabel }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      genre: row.genre || 'Unknown',
      songs_count: Number(row.songs_count || 0),
      total_streams: Number(row.total_streams || 0)
    }));
  }, [data]);

  return (
    <ChartCard
      title="Songs Count by Genre"
      subtitle={`Most represented genres${countryLabel ? ` in ${countryLabel}` : ''}`}
      data={chartData}
      height={360}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} {...COMMON_CHART_PROPS} margin={{ ...COMMON_CHART_PROPS.margin, bottom: 60 }}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis
            dataKey="genre"
            {...COMMON_AXIS_PROPS}
            angle={-30}
            textAnchor="end"
            interval={0}
            height={75}
          />
          <YAxis {...COMMON_AXIS_PROPS} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="songs_count" name="Songs Count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`${entry.genre}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default GenreSongCountChart;
