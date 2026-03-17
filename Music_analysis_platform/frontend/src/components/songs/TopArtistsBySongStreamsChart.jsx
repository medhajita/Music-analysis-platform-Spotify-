import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import {
  ChartCard,
  CustomTooltip,
  COMMON_CHART_PROPS,
  COMMON_AXIS_PROPS,
  COMMON_GRID_PROPS,
  numberTickFormatter
} from '../../config/charts';

const truncate = (value, max = 18) => {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
};

const TopArtistsBySongStreamsChart = ({ data, countryLabel }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      artist: row.artist || 'Unknown',
      total_streams: Number(row.total_streams || 0),
      songs_count: Number(row.songs_count || 0)
    }));
  }, [data]);

  return (
    <ChartCard
      title="Top Artists by Song Streams"
      subtitle={`Most streamed artists${countryLabel ? ` in ${countryLabel}` : ''}`}
      data={chartData}
      height={360}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} {...COMMON_CHART_PROPS} margin={{ ...COMMON_CHART_PROPS.margin, left: 80 }}>
          <defs>
            <linearGradient id="topArtistsSongsGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>
          <CartesianGrid {...COMMON_GRID_PROPS} horizontal={true} />
          <XAxis type="number" {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <YAxis
            type="category"
            dataKey="artist"
            width={140}
            {...COMMON_AXIS_PROPS}
            tickFormatter={(value) => truncate(value)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="total_streams" name="Streams" fill="url(#topArtistsSongsGradient)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopArtistsBySongStreamsChart;
