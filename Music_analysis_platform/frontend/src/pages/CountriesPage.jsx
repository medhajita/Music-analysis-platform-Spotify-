import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../hooks/useApi';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CountriesChoropleth from '../components/countries/CountriesChoropleth';
import DataTable from '../components/common/DataTable';
import CountryFlag from '../components/common/CountryFlag';
import { 
  Globe, 
  Users, 
  Disc, 
  Trophy,
  Activity,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { formatNumber } from '../utils/format';

const CountriesPage = () => {
  const [selectedCountry, setSelectedCountry] = useState({ code: 'FR', name: 'France' });
  const [mapMode, setMapMode] = useState('streams');
  const [mapSelectedOnly, setMapSelectedOnly] = useState(false);
  const [countryDetails, setCountryDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const { data: countries, loading, error } = useApi('/countries');

  const countryOptions = useMemo(() => {
    if (!Array.isArray(countries)) return [];
    return countries
      .filter((c) => /^[A-Z]{2}$/.test(String(c.country_code || '').toUpperCase()))
      .map((c) => ({ code: String(c.country_code).toUpperCase(), name: c.country }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  const countriesByCode = useMemo(() => {
    const map = new Map();
    if (Array.isArray(countries)) {
      countries.forEach((c) => {
        const code = String(c.country_code || '').toUpperCase();
        if (code) map.set(code, c);
      });
    }
    return map;
  }, [countries]);

  useEffect(() => {
    if (countryOptions.length === 0) return;
    const exists = countryOptions.some((c) => c.code === selectedCountry.code);
    if (!exists) {
      setSelectedCountry(countryOptions[0]);
    }
  }, [countryOptions, selectedCountry.code]);

  const columns = useMemo(() => [
    { 
      key: 'country', 
      label: 'Marché', 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
           <CountryFlag code={row.country_code} />
           <span className="text-sm font-bold text-white uppercase tracking-tight">{row.country}</span>
           <span className="text-[9px] font-black text-slate-600 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">{row.country_code}</span>
        </div>
      )
    },
    { key: 'artists_count', label: 'Artistes', sortable: true, render: (row) => <span className="font-mono text-slate-300">{formatNumber(row.artists_count)}</span> },
    { key: 'albums_count', label: 'Albums', sortable: true, render: (row) => <span className="font-mono text-slate-500">{formatNumber(row.albums_count)}</span> },
    { key: 'total_songs_count', label: 'Titres', sortable: true, render: (row) => <span className="font-mono text-slate-500">{formatNumber(row.total_songs_count)}</span> },
    { 
      key: 'total_streams', 
      label: 'Streams Cumulés', 
      sortable: true,
      render: (row) => (
        <span className="text-emerald-400 font-bold font-mono">
          {formatNumber(Number(row.total_artist_streams || 0) + Number(row.total_album_streams || 0))}
        </span>
      )
    }
  ], []);

  useEffect(() => {
    if (selectedCountry?.code) {
      setDetailsLoading(true);
      api.get(`/countries/${selectedCountry.code}/details?name=${encodeURIComponent(selectedCountry.name)}`)
        .then(res => setCountryDetails(res.data))
        .catch(err => console.error(err))
        .finally(() => setDetailsLoading(false));
    }
  }, [selectedCountry]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/50">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            🌍 Cartographie des Marchés
          </h1>
          <p className="text-slate-500 font-medium font-serif italic text-sm">Analyse comparative des puissances musicales par territoire.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shadow-inner">
          <div className="flex bg-slate-950/60 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setMapMode('streams')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors ${
                mapMode === 'streams' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Streams Pays
            </button>
            <button
              onClick={() => setMapMode('local')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-colors ${
                mapMode === 'local' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Local (A+A)
            </button>
          </div>
          <label className="text-[10px] font-black uppercase text-slate-500 px-2 italic">Épicentre</label>
          <select 
            value={mapSelectedOnly ? selectedCountry.code : ''}
            onChange={(e) => {
               const nextCode = e.target.value;
               if (!nextCode) {
                 setMapSelectedOnly(false);
                 return;
               }
               const c = countryOptions.find((x) => x.code === nextCode);
               if (c) {
                 setSelectedCountry({ code: c.code, name: c.name });
                 setMapSelectedOnly(true);
               }
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-2 text-xs font-bold text-emerald-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
          >
            <option value="">Tous les pays</option>
            {countryOptions.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Map Visualization */}
      <CountriesChoropleth 
        data={countries} 
        onCountryClick={(c) => {
          const code = String(c.code || '').toUpperCase();
          const row = countriesByCode.get(code);
          setSelectedCountry({
            code,
            name: row?.country || c.name
          });
          setMapSelectedOnly(true);
        }}
        selectedCountryCode={selectedCountry.code}
        selectedCountryName={selectedCountry.name}
        mode={mapMode}
        selectedOnly={mapSelectedOnly}
      />

      {/* Selected Country Deep Dive */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-slate-900/40 rounded-3xl p-8 border border-slate-800/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500 pointer-events-none">
             <Trophy size={160} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <Globe size={32} />
               </div>
               <div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">{selectedCountry.name}</h2>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{selectedCountry.code} • Local Insights</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {(() => {
                  const c = Array.isArray(countries) ? countries.find(x => x.country_code === selectedCountry.code) : null;
                  return (
                    <>
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Artistes</p>
                        <p className="text-xl font-black text-white">{formatNumber(c?.artists_count)}</p>
                      </div>
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Albums</p>
                        <p className="text-xl font-black text-white">{formatNumber(c?.albums_count)}</p>
                      </div>
                      <div className="col-span-2 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl shadow-lg shadow-emerald-950/20">
                        <p className="text-[9px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Puissance Critique (Streams)</p>
                        <p className="text-3xl font-black text-emerald-400 drop-shadow-sm">
                          {formatNumber(Number(c?.total_artist_streams || 0) + Number(c?.total_album_streams || 0))}
                        </p>
                      </div>
                    </>
                  )
               })()}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-slate-900/40 rounded-3xl p-8 border border-slate-800/50 shadow-2xl backdrop-blur-md">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                 <Activity size={16} className="text-emerald-500" />
                 Market Leaders (Top 5)
              </h3>
              {detailsLoading && <LoadingSpinner size="h-4 w-4" />}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-500/50 border-b border-slate-800 pb-2">Artistes</h4>
                 <div className="space-y-4">
                    {countryDetails?.artists?.map((a, i) => (
                       <div key={i} className="flex items-center gap-3 group/item">
                          <img src={a.artist_image_url} className="w-10 h-10 rounded-xl shadow-lg border border-slate-800 object-cover transition-transform group-hover/item:scale-110" alt=""/>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold truncate text-slate-200 group-hover/item:text-emerald-400 transition-colors uppercase tracking-tight">{a.artist}</p>
                             <p className="text-[9px] font-black text-slate-600 uppercase italic">{formatNumber(a.total_streams)}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-500/50 border-b border-slate-800 pb-2">Albums</h4>
                 <div className="space-y-4">
                    {countryDetails?.albums?.map((a, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <img src={a.album_image_url} className="w-10 h-10 rounded-xl shadow-lg border border-slate-800 object-cover" alt=""/>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold truncate text-slate-200 uppercase tracking-tight">{a.album_title}</p>
                             <p className="text-[9px] font-black text-slate-600 uppercase italic truncate">{a.artist}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-500/50 border-b border-slate-800 pb-2">Titres</h4>
                 <div className="space-y-4">
                    {countryDetails?.songs?.map((s, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <img src={s.image} className="w-10 h-10 rounded-xl shadow-lg border border-slate-800 object-cover" alt=""/>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold truncate text-slate-200 uppercase tracking-tight">{s.title}</p>
                             <p className="text-[9px] font-black text-emerald-500/80 uppercase">{formatNumber(s.streams)}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Statistics Table */}
      <section className="space-y-4">
        <DataTable 
            columns={columns} 
            data={countries || []} 
            loading={loading} 
            title="countries_ranking"
            pageSize={15}
            onRowClick={(row) => {
              const code = String(row.country_code || '').toUpperCase();
              if (!/^[A-Z]{2}$/.test(code)) return;
              setSelectedCountry({ code, name: row.country });
              setMapSelectedOnly(true);
            }}
        />
      </section>

    </div>
  );
};

export default CountriesPage;
