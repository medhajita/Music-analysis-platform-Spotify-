import React from 'react';

/**
 * Displays colorful badges for stream milestones
 * @param {number} value - Stream count
 * @param {string} label - Optional label override (e.g. "1B")
 */
const StreamBadge = ({ value, label, className = "" }) => {
  const getBadgeStyle = (val) => {
    if (val >= 1000000000) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    if (val >= 100000000) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (val >= 10000000) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (val >= 1000000) return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    return "bg-slate-800/50 text-slate-500 border-slate-800";
  };

  const getLabel = (val) => {
    if (label) return label;
    if (val >= 1000000000) return "1B+";
    if (val >= 100000000) return "100M+";
    if (val >= 10000000) return "10M+";
    if (val >= 1000000) return "1M+";
    return "< 1M";
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-tighter ${getBadgeStyle(value)} ${className}`}>
      {getLabel(value)}
    </span>
  );
};

export default StreamBadge;
