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
  COMMON_GRID_PROPS,
  formatNumber,
  numberTickFormatter
} from '../../config/charts';

const TopSongsBarChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.slice(0, 20).map(song => ({
      name: song.song_title || song.song || 'Unknown',
      artist: song.artist || 'Unknown',
      value: Number(song.streams_songs || song.total_global || song.total_streams_song_per_country || 0)
    }));
  }, [data]);

  const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <ChartCard 
      title="Top 20 Titres par Streams" 
      subtitle="Total des écoutes sur l'ensemble des marchés"
      data={chartData}
      height={500}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          {...COMMON_CHART_PROPS}
          margin={{ ...COMMON_CHART_PROPS.margin, left: 80 }}
        >
          <CartesianGrid {...COMMON_GRID_PROPS} horizontal={true} />
          <XAxis 
            type="number" 
            {...COMMON_AXIS_PROPS}
            tickFormatter={numberTickFormatter}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            {...COMMON_AXIS_PROPS}
            width={120}
            tickFormatter={(val) => truncate(val, 20)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                fillOpacity={1 - (index * 0.03)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopSongsBarChart;
