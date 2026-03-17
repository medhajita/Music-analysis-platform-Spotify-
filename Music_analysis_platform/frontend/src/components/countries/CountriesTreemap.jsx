import React, { useMemo } from 'react';
import { 
  Treemap, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

import { 
  CHART_COLORS, 
  ChartCard, 
  CustomTooltip,
  formatNumber
} from '../../config/charts';

const CountriesTreemap = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    const continentMap = {
      'US': 'Amérique du Nord', 'CA': 'Amérique du Nord', 'MX': 'Amérique du Nord',
      'FR': 'Europe', 'GB': 'Europe', 'DE': 'Europe', 'ES': 'Europe', 'IT': 'Europe', 'RU': 'Europe',
      'BR': 'Amérique du Sud', 'AR': 'Amérique du Sud', 'CO': 'Amérique du Sud',
      'JP': 'Asie', 'KR': 'Asie', 'CN': 'Asie', 'IN': 'Asie',
      'AU': 'Océanie', 'NZ': 'Océanie',
      'NG': 'Afrique', 'ZA': 'Afrique', 'EG': 'Afrique'
    };

    const grouped = {};
    data.forEach(item => {
      const region = continentMap[item.country_code] || 'Autres';
      if (!grouped[region]) grouped[region] = { name: region, children: [] };
      grouped[region].children.push({
        name: item.country,
        size: Number(item.total_artist_streams || 0) + Number(item.total_album_streams || 0)
      });
    });

    return Object.values(grouped);
  }, [data]);

  const CustomizedContent = (props) => {
    const { x, y, width, height, index, name, size } = props;
    if (width < 40 || height < 30) return null;

    const color = CHART_COLORS[index % CHART_COLORS.length];

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            fillOpacity: 0.8,
            stroke: '#191414',
            strokeWidth: 2,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 5}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
          fontWeight="900"
          style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {name && name.length > width / 6 ? name.substr(0, Math.floor(width / 6)) + '..' : (name || '')}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#000"
          fontSize={9}
          fontWeight="bold"
          opacity={0.6}
        >
          {formatNumber(size)}
        </text>
      </g>
    );
  };

  return (
    <ChartCard 
      title="Répartition par Marché" 
      subtitle="Poids relatif des flux par pays et région"
      data={data}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={chartData}
          dataKey="size"
          stroke="#fff"
          fill="#1DB954"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default CountriesTreemap;
