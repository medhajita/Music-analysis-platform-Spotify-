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

const truncate = (value, max = 28) => {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
};

const Top20MostStreamedSongsChart = ({ data }) => {
  const chartData = useMemo(() => {
    const source = Array.isArray(data) ? data : data?.data || [];
    return [...source]
      .sort((a, b) => Number(b.streams_songs || 0) - Number(a.streams_songs || 0))
      .slice(0, 20)
      .map((song) => ({
        song_artist_label: `${song.song_title || song.song || 'Unknown'} - ${song.artist || 'Unknown'}`,
        streams: Number(song.streams_songs || 0)
      }));
  }, [data]);

  return (
    <ChartCard
      title="Top 20 Most Streamed Songs"
      subtitle="Horizontal ranking with song + artist labels"
      data={chartData}
      height={430}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 140 }}
        >
          <defs>
            <linearGradient id="topSongsGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <CartesianGrid {...COMMON_GRID_PROPS} horizontal={true} />
          <XAxis type="number" {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <YAxis
            type="category"
            dataKey="song_artist_label"
            width={220}
            {...COMMON_AXIS_PROPS}
            tickFormatter={(value) => truncate(value)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="streams" name="Streams" fill="url(#topSongsGradient)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default Top20MostStreamedSongsChart;
