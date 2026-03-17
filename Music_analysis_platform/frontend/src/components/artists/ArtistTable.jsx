import React from 'react';
import DataTable from '../common/DataTable';
import CountryFlag from '../common/CountryFlag';
import StreamBadge from '../common/StreamBadge';
import { formatNumber } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

const ArtistTable = ({ artists, loading, activeTab }) => {
  const navigate = useNavigate();

  const handleRowClick = (artistName) => {
    navigate(`/search?q=${encodeURIComponent(artistName)}`);
  };

  const columns = [
    { 
      key: 'artist', 
      label: 'Artiste', 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleRowClick(row.artist)}>
          {row.artist_image_url && (
            <img src={row.artist_image_url} alt={row.artist} className="w-8 h-8 rounded-full border border-slate-700 transition-transform group-hover:scale-110" />
          )}
          <span className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{row.artist}</span>
        </div>
      )
    },
    { 
      key: 'genre', 
      label: 'Genre', 
      sortable: true,
      render: (row) => <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-800 rounded text-slate-400 border border-slate-700">{row.genre}</span>
    },
    { 
      key: 'country_code', 
      label: 'Pays', 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <CountryFlag code={row.country_code || (row.country === 'United States' ? 'US' : null)} />
          <span className="text-xs font-medium text-slate-400">{row.country}</span>
        </div>
      )
    }
  ];

  if (activeTab === 'streams' || !activeTab) {
    columns.splice(1, 0, 
      { key: 'total_streams', label: 'Streams', sortable: true, format: (v) => formatNumber(v) },
      { key: 'solo_streams', label: 'Solo', sortable: true, format: (v) => formatNumber(v) },
      { key: 'feat_streams', label: 'Feats', sortable: true, format: (v) => formatNumber(v) }
    );
  } else if (activeTab === 'listeners') {
    columns.splice(1, 0, 
      { key: 'listeners', label: 'Auditeurs', sortable: true, format: (v) => formatNumber(v) },
      { key: 'peak_listeners', label: 'Peak', sortable: true, format: (v) => formatNumber(v) }
    );
  } else if (activeTab === 'followers') {
      columns.splice(1, 0, 
        { key: 'followers', label: 'Followers', sortable: true, format: (v) => formatNumber(v) },
        { 
          key: 'daily_gain_followers', 
          label: 'Gain Quotidien', 
          sortable: true, 
          render: (row) => <span className="text-emerald-400 font-bold">{row.daily_gain_followers > 0 ? '+' : ''}{formatNumber(row.daily_gain_followers)}</span>
        },
        { 
          key: 'weekly_gain_followers', 
          label: 'Gain Hebdo', 
          sortable: true, 
          render: (row) => <span className="text-emerald-500 font-bold">{row.weekly_gain_followers > 0 ? '+' : ''}{formatNumber(row.weekly_gain_followers)}</span>
        }
      );
  } else if (activeTab === 'tracks') {
    columns.splice(1, 0, 
      { key: 'tracks', label: 'Total Titres', sortable: true, format: (v) => formatNumber(v) },
      { key: 'streams_1B', label: '1B+', sortable: true, render: (row) => <StreamBadge value={1000000000} label={row.streams_1B} /> },
      { key: 'streams_100M', label: '100M+', sortable: true, render: (row) => <StreamBadge value={100000000} label={row.streams_100M} /> },
      { key: 'streams_10M', label: '10M+', sortable: true, render: (row) => <StreamBadge value={10000000} label={row.streams_10M} /> },
      { key: 'streams_1M', label: '1M+', sortable: true, render: (row) => <StreamBadge value={1000000} label={row.streams_1M} /> }
    );
  }

  return (
    <DataTable 
      columns={columns} 
      data={artists} 
      loading={loading} 
      title={`artists_${activeTab || 'overview'}`}
      pageSize={15}
    />
  );
};

export default ArtistTable;
