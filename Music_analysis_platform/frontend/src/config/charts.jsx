import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

// ═══════════════════════════════════════════
// 1. PALETTE DE COULEURS
// ═══════════════════════════════════════════

export const CHART_COLORS = [
  '#1DB954', // Spotify green
  '#509BF5', // Blue
  '#E8115B', // Pink/Red
  '#EF9F27', // Amber
  '#B49BC8', // Purple light
  '#56B4D3', // Cyan
  '#F4845F', // Coral
  '#A8D8A8', // Mint
  '#FF6B6B', // Red soft
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#C7B8EA', // Lavender
];

export const MAP_COLOR_SCALE = ['#E8F5E9', '#A5D6A7', '#4CAF50', '#1DB954', '#0A6B2E'];

export const TWO_SERIES_COLORS = {
  primary: '#1DB954',
  secondary: '#509BF5',
};

export const THREE_SERIES_COLORS = {
  artists: '#1DB954',
  albums: '#509BF5',
  songs: '#E8115B',
};

// ═══════════════════════════════════════════
// 4. FONCTION formatNumber
// ═══════════════════════════════════════════

export function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

export const numberTickFormatter = (v) => formatNumber(v);

// ═══════════════════════════════════════════
// 2. CUSTOM TOOLTIP
// ═══════════════════════════════════════════

export const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#191414]/92 border border-[#333] p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-white font-bold mb-2 uppercase tracking-tight">
          {formatter ? formatter(label) : label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-xs flex justify-between gap-4" style={{ color: entry.color || entry.fill }}>
              <span className="opacity-80 font-medium">{entry.name}:</span>
              <span className="font-bold">{formatNumber(entry.value)}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ═══════════════════════════════════════════
// 3. PROPS COMMUNES
// ═══════════════════════════════════════════

export const COMMON_CHART_PROPS = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  style: { fontFamily: 'Inter, sans-serif', fontSize: 12 },
};

export const COMMON_AXIS_PROPS = {
  tick: { fill: '#B3B3B3', fontSize: 11 },
  axisLine: { stroke: '#333' },
  tickLine: false,
};

export const COMMON_GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: '#2A2A2A',
  vertical: false,
};

export const COMMON_LEGEND_PROPS = {
  wrapperStyle: { fontSize: 12, color: '#B3B3B3', paddingTop: 12 },
};

// ═══════════════════════════════════════════
// 5. WRAPPER COMPOSANT ChartCard
// ═══════════════════════════════════════════

export const ChartCard = ({ title, subtitle, children, height = 320, data = [] }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (children) {
      setLoading(false);
    }
  }, [children]);

  const downloadCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#191414] rounded-xl p-5 border border-white/5 shadow-2xl transition-all hover:border-white/10 group h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white text-[15px] font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="text-[#B3B3B3] text-[12px] mt-1 font-medium">{subtitle}</p>}
        </div>
        <button 
          onClick={downloadCSV}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#B3B3B3] hover:text-white transition-colors"
          title="Exporter en CSV"
        >
          <Download size={16} />
        </button>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative flex-grow">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse rounded-lg">
             <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
