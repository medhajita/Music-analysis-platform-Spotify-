import React, { useMemo, useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import ArtistTable from '../components/artists/ArtistTable';
import TopListenersHorizontalBarChart from '../components/artists/TopListenersHorizontalBarChart';
import TopStreamsHorizontalBarChart from '../components/artists/TopStreamsHorizontalBarChart';
import TopFollowersChart from '../components/artists/TopFollowersChart';
import ArtistTitleStatsOverviewChart from '../components/artists/ArtistTitleStatsOverviewChart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Users, Activity, TrendingUp, BarChart, Search, Filter } from 'lucide-react';

const ArtistsPage = () => {
  const [activeTab, setActiveTab] = useState('listeners');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedChartArtist, setSelectedChartArtist] = useState('');

  const { data: genres } = useApi('/genres');
  const { data: countries } = useApi('/countries');

  const sortByTab = {
    listeners: 'listeners',
    streams: 'total_streams',
    followers: 'followers',
    tracks: 'tracks'
  };

  const artistsQuery = useMemo(() => {
    const params = new URLSearchParams({
      limit: '20',
      offset: String(page * 20),
      sort: sortByTab[activeTab] || 'total_streams',
      order: 'DESC'
    });

    if (debouncedSearch) params.set('search', debouncedSearch);
    if (genreFilter) params.set('genre', genreFilter);
    if (countryFilter) params.set('country', countryFilter);

    return `/artists?${params.toString()}`;
  }, [page, activeTab, debouncedSearch, genreFilter, countryFilter]);

  const topChartQuery = useMemo(() => {
    const params = new URLSearchParams({ limit: '15' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (genreFilter) params.set('genre', genreFilter);
    if (countryFilter) params.set('country', countryFilter);
    return params.toString();
  }, [debouncedSearch, genreFilter, countryFilter]);

  const { data: artistsData, loading: artistsLoading, error: artistsError } = useApi(artistsQuery);
  const { data: listenersChartData, loading: listenersChartLoading, error: listenersChartError } = useApi(`/artists/top-listeners?${topChartQuery}`);
  const { data: streamsChartData, loading: streamsChartLoading, error: streamsChartError } = useApi(`/artists/top-streams?${topChartQuery}`);
  const { data: followersChartData, loading: followersChartLoading, error: followersChartError } = useApi(`/artists/top-followers?${topChartQuery}`);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleTopArtistSelect = (artistName, tabId) => {
    setSelectedChartArtist(artistName);
    setSearchTerm(artistName);
    setDebouncedSearch(artistName);
    setActiveTab(tabId);
    setPage(0);
  };

  if (artistsLoading) return <LoadingSpinner />;
  if (artistsError) return <ErrorMessage message={artistsError} />;

  const chartError = listenersChartError || streamsChartError || followersChartError;
  const titleStatsChartData = (artistsData?.data || []).slice(0, 15);

  const tabs = [
    { id: 'listeners', label: 'Most Listeners', icon: <Users size={16} /> },
    { id: 'streams', label: 'Most Streams', icon: <Activity size={16} /> },
    { id: 'followers', label: 'Most Followers', icon: <TrendingUp size={16} /> },
    { id: 'tracks', label: 'Track Stats', icon: <BarChart size={16} /> }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analyse des Artistes</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Classements, statistiques de titres et distributions demographiques.
          </p>
        </div>
      </header>

      <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(0);
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-primary-light text-primary-light bg-primary-light/5'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedChartArtist('');
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setSelectedChartArtist('');
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl appearance-none outline-none focus:border-primary-light transition-colors text-sm"
          >
            <option value="">Tous les genres</option>
            {genres?.map((g) => (
              <option key={g.genre} value={g.genre}>
                {g.genre}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setSelectedChartArtist('');
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl appearance-none outline-none focus:border-primary-light transition-colors text-sm"
          >
            <option value="">Tous les pays</option>
            {countries?.map((c) => (
              <option key={c.country_code} value={c.country}>
                {c.country}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section>
        <ArtistTable artists={artistsData?.data || []} activeTab={activeTab} loading={artistsLoading} />
      </section>

      {chartError && <ErrorMessage message={chartError} />}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {listenersChartLoading ? (
          <LoadingSpinner />
        ) : (
          <TopListenersHorizontalBarChart
            data={listenersChartData || []}
            selectedArtist={selectedChartArtist}
            onArtistSelect={(artist) => handleTopArtistSelect(artist, 'listeners')}
          />
        )}
        {streamsChartLoading ? (
          <LoadingSpinner />
        ) : (
          <TopStreamsHorizontalBarChart
            data={streamsChartData || []}
            selectedArtist={selectedChartArtist}
            onArtistSelect={(artist) => handleTopArtistSelect(artist, 'streams')}
          />
        )}
        {followersChartLoading ? (
          <LoadingSpinner />
        ) : (
          <TopFollowersChart
            data={followersChartData || []}
            selectedArtist={selectedChartArtist}
            onArtistSelect={(artist) => handleTopArtistSelect(artist, 'followers')}
          />
        )}
        <ArtistTitleStatsOverviewChart data={titleStatsChartData} />
      </section>
    </div>
  );
};

export default ArtistsPage;
