import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import {
  ChartCard,
  CustomTooltip,
  COMMON_CHART_PROPS,
  COMMON_AXIS_PROPS,
  COMMON_GRID_PROPS,
  COMMON_LEGEND_PROPS,
  numberTickFormatter
} from '../../config/charts';

const truncate = (value, size = 18) => {
  if (!value) return '';
  return value.length > size ? `${value.slice(0, size - 1)}...` : value;
};

const ArtistTitleStatsOverviewChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return [...data]
      .sort((a, b) => Number(b.tracks || 0) - Number(a.tracks || 0))
      .slice(0, 15)
      .map((artist) => {
        const titles = Number(artist.tracks || 0);
        const totalStreams = Number(artist.total_streams || 0);

        return {
          artist_name: artist.artist_name || artist.artist || 'Unknown',
          titles,
          avg_streams_per_title: titles > 0 ? totalStreams / titles : 0
        };
      });
  }, [data]);

  return (
    <ChartCard
      title="Artist Title Stats Overview"
      subtitle="Titles count and average streams per title"
      data={chartData}
      height={420}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} {...COMMON_CHART_PROPS} margin={{ ...COMMON_CHART_PROPS.margin, left: 20, right: 20 }}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis
            dataKey="artist_name"
            {...COMMON_AXIS_PROPS}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={80}
            tickFormatter={(value) => truncate(value, 14)}
          />
          <YAxis yAxisId="left" {...COMMON_AXIS_PROPS} />
          <YAxis yAxisId="right" orientation="right" {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend {...COMMON_LEGEND_PROPS} />
          <Bar yAxisId="left" dataKey="titles" name="Number of Titles" fill="#E8115B" radius={[6, 6, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avg_streams_per_title"
            name="Avg Streams per Title"
            stroke="#56B4D3"
            strokeWidth={3}
            dot={{ r: 3, fill: '#56B4D3' }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ArtistTitleStatsOverviewChart;
