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

const Top20MostStreamedSongsChart = ({ data, countryLabel }) => {
  const chartData = useMemo(() => {
    const source = Array.isArray(data) ? data : data?.data || [];
    return [...source]
      .sort((a, b) => Number(b.streams_songs || b.total_streams_song_per_country || b.total_global || 0) - Number(a.streams_songs || a.total_streams_song_per_country || a.total_global || 0))
      .slice(0, 20)
      .map((song, index) => ({
        song_artist_label: `${song.song_title || song.song_name || song.song || song.title || `Song ${index + 1}`} - ${song.artist || song.artist_name || 'Unknown Artist'}`,
        streams: Number(song.streams_songs || song.total_streams_song_per_country || song.total_global || 0)
      }));
  }, [data]);

  return (
    <ChartCard
      title="Top 20 Most Streamed Songs"
      subtitle={`Horizontal ranking with song + artist labels${countryLabel ? ` (${countryLabel})` : ''}`}
      data={chartData}
      height={500}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 10, right: 30 }}
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
            width={300}
            interval={0}
            tickMargin={10}
            {...COMMON_AXIS_PROPS}
            tick={{
              ...COMMON_AXIS_PROPS.tick,
              fontSize: 10
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="streams" name="Streams" fill="url(#topSongsGradient)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default Top20MostStreamedSongsChart;
