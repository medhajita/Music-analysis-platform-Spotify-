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
  numberTickFormatter
} from '../../config/charts';

const SongsPopularityByCountryChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data]
      .sort((a, b) => Number(b.total_streams || 0) - Number(a.total_streams || 0))
      .slice(0, 10)
      .map((item) => ({
        country: item.country || 'Unknown',
        country_code: item.country_code || 'N/A',
        streams: Number(item.total_streams || 0)
      }));
  }, [data]);

  return (
    <ChartCard
      title="Songs Popularity Around the World"
      subtitle="Top 10 countries by aggregated streams"
      data={chartData}
      height={360}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} {...COMMON_CHART_PROPS} margin={{ ...COMMON_CHART_PROPS.margin, bottom: 50 }}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis
            dataKey="country_code"
            {...COMMON_AXIS_PROPS}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
          />
          <YAxis {...COMMON_AXIS_PROPS} tickFormatter={numberTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="streams" name="Streams" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`${entry.country_code}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SongsPopularityByCountryChart;
