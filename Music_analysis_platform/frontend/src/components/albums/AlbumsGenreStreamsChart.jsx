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

const AlbumsGenreStreamsChart = ({ data }) => {
  const chartData = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    const genreMap = {};

    source.forEach((album) => {
      const genre = album.genre || 'Unknown';
      if (!genreMap[genre]) {
        genreMap[genre] = { genre, streams: 0, albums: 0 };
      }
      genreMap[genre].streams += Number(album.streams_albums || 0);
      genreMap[genre].albums += 1;
    });

    return Object.values(genreMap)
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 10);
  }, [data]);

  return (
    <ChartCard
      title="Top Genres by Album Streams"
      subtitle="Top 10 genres by summed album streams"
      data={chartData}
      height={320}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 90 }}
        >
          <defs>
            <linearGradient id="albumsGenreGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <CartesianGrid {...COMMON_GRID_PROPS} horizontal={true} />
          <XAxis type="number" {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <YAxis
            type="category"
            dataKey="genre"
            width={140}
            {...COMMON_AXIS_PROPS}
            tickFormatter={(value) => truncate(value)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="streams" name="Streams" fill="url(#albumsGenreGradient)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default AlbumsGenreStreamsChart;
