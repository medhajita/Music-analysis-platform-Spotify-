import React, { useMemo, useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import Top20MostStreamedSongsChart from '../components/songs/Top20MostStreamedSongsChart';
import SongsPopularityByCountryChart from '../components/songs/SongsPopularityByCountryChart';
import TopArtistsBySongStreamsChart from '../components/songs/TopArtistsBySongStreamsChart';
import GenreSongCountChart from '../components/songs/GenreSongCountChart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DataTable from '../components/common/DataTable';
import CountryFlag from '../components/common/CountryFlag';
import { Music2, Globe, MapPin, Search } from 'lucide-react';
import { formatNumber } from '../utils/format';

const SongsPage = () => {
  const [activeTab, setActiveTab] = useState('most-streamed');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');

  const { data: countries } = useApi('/countries');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const endpoint = activeTab === 'most-streamed'
    ? `/songs/most-streamed?limit=100&search=${debouncedSearch}`
    : activeTab === 'worldwide'
      ? `/songs/worldwide?limit=100&search=${debouncedSearch}`
      : `/songs/by-country?country_code=${selectedCountry}&limit=100`;

  const { data: songsData, loading, error } = useApi(endpoint);

  const { data: top20SongsData, loading: top20Loading, error: top20Error } = useApi(
    `/songs/by-country?country_code=${selectedCountry}&limit=20`
  );
  const { data: popularityByCountryData, loading: popularityLoading, error: popularityError } = useApi(
    '/songs/top-countries-streams?limit=10'
  );
  const { data: topArtistsByStreamsData, loading: topArtistsLoading, error: topArtistsError } = useApi(
    `/songs/top-artists-streams?limit=10&country_code=${selectedCountry}`
  );
  const { data: genreSongCountData, loading: genreSongCountLoading, error: genreSongCountError } = useApi(
    `/songs/genre-song-count?limit=10&country_code=${selectedCountry}`
  );

  const countryOptions = useMemo(() => {
    if (!Array.isArray(countries)) return [];
    const uniqueByCode = new Map();
    countries.forEach((c) => {
      if (c.country_code && !uniqueByCode.has(c.country_code)) {
        uniqueByCode.set(c.country_code, c.country);
      }
    });
    return [...uniqueByCode.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);
  const selectedCountryLabel = useMemo(() => {
    const match = countryOptions.find((c) => c.code === selectedCountry);
    return match ? `${match.name} (${match.code})` : selectedCountry;
  }, [countryOptions, selectedCountry]);

  const columns = useMemo(() => {
    const base = [
      {
        key: 'song_title',
        label: 'Chanson',
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.song_image_url && <img src={row.song_image_url} className="w-8 h-8 rounded shadow border border-slate-700" alt="" />}
            <span className="text-sm font-bold text-white uppercase tracking-tight">{row.song_title || row.song}</span>
          </div>
        )
      },
      { key: 'artist', label: 'Artiste', sortable: true }
    ];

    if (activeTab === 'worldwide') {
      return [
        ...base,
        {
          key: 'countries_count',
          label: 'Pays',
          sortable: true,
          render: (row) => <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-black text-slate-400 border border-slate-700">{row.countries_count} PAYS</span>
        },
        {
          key: 'total_global',
          label: 'Streams Globaux',
          sortable: true,
          format: (v) => <span className="text-emerald-400 font-bold">{formatNumber(v)}</span>
        }
      ];
    }

    return [
      ...base,
      {
        key: 'genre',
        label: 'Genre / Pays',
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <CountryFlag code={row.streamed_country_code || row.country_code} />
            <span className="text-[10px] text-slate-500 font-bold uppercase">{row.genre || '-'}</span>
          </div>
        )
      },
      {
        key: 'streams',
        label: 'Streams',
        sortable: true,
        render: (row) => <span className="text-emerald-400 font-bold">{formatNumber(row.streams_songs || row.total_streams_song_per_country)}</span>
      }
    ];
  }, [activeTab]);

  const tabs = [
    { id: 'most-streamed', label: 'Top Streams', icon: <Music2 size={16} /> },
    { id: 'worldwide', label: 'Worldwide Agg', icon: <Globe size={16} /> },
    { id: 'by-country', label: 'By Country', icon: <MapPin size={16} /> }
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const tableData = Array.isArray(songsData) ? songsData : songsData?.data || [];
  const chartsError = top20Error || popularityError || topArtistsError || genreSongCountError;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analyse des Titres</h1>
          <p className="text-slate-500 font-medium font-serif italic text-sm">
            Performance globale et dynamiques de streaming par pays, periode et genre.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50">
        <div className="flex bg-slate-950/50 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition-all whitespace-nowrap rounded-lg ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-300"
          >
            {countryOptions.length > 0 ? (
              countryOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))
            ) : (
              <option value="US">United States (US)</option>
            )}
          </select>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Filtrer titres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      <section>
        <DataTable
          columns={columns}
          data={tableData}
          loading={loading}
          title={`songs_${activeTab}`}
          pageSize={15}
        />
      </section>

      {chartsError && <ErrorMessage message={chartsError} />}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {top20Loading ? <LoadingSpinner /> : <Top20MostStreamedSongsChart data={top20SongsData || []} countryLabel={selectedCountryLabel} />}
        {topArtistsLoading ? <LoadingSpinner /> : <TopArtistsBySongStreamsChart data={topArtistsByStreamsData || []} countryLabel={selectedCountryLabel} />}
        {popularityLoading ? <LoadingSpinner /> : <SongsPopularityByCountryChart data={popularityByCountryData || []} />}
        {genreSongCountLoading ? <LoadingSpinner /> : <GenreSongCountChart data={genreSongCountData || []} countryLabel={selectedCountryLabel} />}
      </section>
    </div>
  );
};

export default SongsPage;
