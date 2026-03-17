import React from 'react';
import {
  AreaChart,
  Area,
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

const ReleaseYearHistogram = ({ data }) => {
  // Chart request: GROUP BY release_year, SUM(streams_albums).
  const yearlyStreams = {};
  (data || []).forEach((album) => {
    const year = Number(album.release_year_albums);
    if (!Number.isFinite(year) || year <= 0) return;

    const streams = Number(album.streams_albums || 0);
    yearlyStreams[year] = (yearlyStreams[year] || 0) + streams;
  });

  const chartData = Object.keys(yearlyStreams)
    .map((year) => Number(year))
    .sort((a, b) => a - b)
    .map((year) => ({
      year,
      streams: yearlyStreams[year]
    }));

  return (
    <ChartCard
      title="Albums Streams by Year"
      subtitle="Timeline grouped by release_year with summed streams"
      data={chartData}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} {...COMMON_CHART_PROPS}>
          <defs>
            <linearGradient id="albumsStreamsByYearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.78} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis dataKey="year" {...COMMON_AXIS_PROPS} />
          <YAxis {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Area
            type="monotone"
            dataKey="streams"
            name="Streams"
            stroke="#22D3EE"
            strokeWidth={2.5}
            fill="url(#albumsStreamsByYearGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ReleaseYearHistogram;
