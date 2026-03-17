import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
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

const truncate = (value, size = 18) => {
  if (!value) return '';
  return value.length > size ? `${value.slice(0, size - 1)}...` : value;
};

const TopListenersHorizontalBarChart = ({ data, onArtistSelect, selectedArtist }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return [...data]
      .sort((a, b) => Number(b.listeners || 0) - Number(a.listeners || 0))
      .slice(0, 15)
      .map((artist) => ({
        artist_name: artist.artist_name || artist.artist || 'Unknown',
        listeners: Number(artist.listeners || 0)
      }));
  }, [data]);

  const hasSelection = Boolean(selectedArtist);
  const handleBarClick = (entry) => {
    const artist = entry?.artist_name || entry?.payload?.artist_name;
    if (artist && onArtistSelect) onArtistSelect(artist);
  };

  return (
    <ChartCard
      title="Top 15 Most Listened Artists"
      subtitle="Sorted by listeners (DESC) - click a bar to filter"
      data={chartData}
      height={420}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 90 }}
        >
          <defs>
            <linearGradient id="listenersGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <CartesianGrid {...COMMON_GRID_PROPS} horizontal={true} />
          <XAxis type="number" {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <YAxis
            type="category"
            dataKey="artist_name"
            width={140}
            {...COMMON_AXIS_PROPS}
            tickFormatter={(value) => truncate(value)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar
            dataKey="listeners"
            name="Listeners"
            radius={[0, 6, 6, 0]}
            cursor="pointer"
            onClick={handleBarClick}
          >
            {chartData.map((entry) => {
              const isSelected = !hasSelection || entry.artist_name === selectedArtist;
              return (
                <Cell
                  key={entry.artist_name}
                  fill={isSelected ? 'url(#listenersGradient)' : '#2A1F33'}
                  fillOpacity={isSelected ? 1 : 0.45}
                  stroke={entry.artist_name === selectedArtist ? '#E2E8F0' : 'none'}
                  strokeWidth={entry.artist_name === selectedArtist ? 1 : 0}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopListenersHorizontalBarChart;
