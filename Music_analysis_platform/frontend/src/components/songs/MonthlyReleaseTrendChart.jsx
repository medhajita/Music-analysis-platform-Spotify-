import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
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
  COMMON_GRID_PROPS
} from '../../config/charts';

const MonthlyReleaseTrendChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data]
      .map((item) => ({
        release_period: item.release_period || 'N/A',
        songs_released: Number(item.songs_released || 0)
      }))
      .sort((a, b) => String(a.release_period).localeCompare(String(b.release_period)));
  }, [data]);

  return (
    <ChartCard
      title="Monthly Release Trend"
      subtitle="Grouped by release month/year - peak release periods"
      data={chartData}
      height={360}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} {...COMMON_CHART_PROPS} margin={{ ...COMMON_CHART_PROPS.margin, bottom: 50 }}>
          <CartesianGrid {...COMMON_GRID_PROPS} />
          <XAxis
            dataKey="release_period"
            {...COMMON_AXIS_PROPS}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={75}
          />
          <YAxis {...COMMON_AXIS_PROPS} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
          <Line
            type="monotone"
            dataKey="songs_released"
            name="Songs Released"
            stroke="#22D3EE"
            strokeWidth={2.5}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default MonthlyReleaseTrendChart;
