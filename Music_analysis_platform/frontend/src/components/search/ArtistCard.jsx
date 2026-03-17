import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  Music,
  Globe,
  Award,
  Sparkles,
  Headphones,
  PlayCircle,
  Star,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../config/charts';
import api from '../../api/axios';
import AlbumsChoroplethMap from '../albums/AlbumsChoroplethMap';

const ArtistCard = ({ artist, source, onCompare, isSelected, isComparison }) => {
  const isDB = source === 'database' || artist.global_rank !== undefined;

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + ' Bn';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + ' Mn';
    return new Intl.NumberFormat().format(num);
  };

  const formatSimilarity = (match) => {
    const value = Number(match || 0);
    const percent = value <= 1 ? value * 100 : value;
    return `${percent.toFixed(1)}%`;
  };

  const totalStreams = Number(artist.total_streams || 0);
  const soloStreams = Number(artist.solo_streams || 0);
  const featStreams = Number(artist.feat_streams || 0);

  const streamData = [
    { name: 'Solo', value: soloStreams },
    { name: 'Feats', value: featStreams },
  ];

  const discography = [
    { label: '1 Bn+', value: artist.streams_1B, color: 'bg-yellow-500' },
    { label: '100 Mn+', value: artist.streams_100M, color: 'bg-purple-500' },
    { label: '10 Mn+', value: artist.streams_10M, color: 'bg-blue-500' },
    { label: '1 Mn+', value: artist.streams_1M, color: 'bg-slate-500' },
  ];

  const bestTracks = Array.isArray(artist.best_tracks) ? artist.best_tracks.slice(0, 5) : [];
  const similarArtists = Array.isArray(artist.similar_artists) ? artist.similar_artists.slice(0, 10) : [];

  const soloPct = totalStreams > 0 ? (soloStreams / totalStreams) * 100 : 0;
  const featPct = totalStreams > 0 ? (featStreams / totalStreams) * 100 : 0;
  const [artistCountryMapData, setArtistCountryMapData] = useState([]);
  const [artistCountryMapLoading, setArtistCountryMapLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const artistName = String(artist?.artist || '').trim();

    if (!artistName) {
      setArtistCountryMapData([]);
      setArtistCountryMapLoading(false);
      return undefined;
    }

    const fetchArtistCountryStreams = async () => {
      try {
        setArtistCountryMapLoading(true);
        const response = await api.get(
          `/search/artist-streamed-countries?artist=${encodeURIComponent(artistName)}&limit=300`
        );
        const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (active) setArtistCountryMapData(rows);
      } catch (error) {
        if (active) setArtistCountryMapData([]);
      } finally {
        if (active) setArtistCountryMapLoading(false);
      }
    };

    fetchArtistCountryStreams();

    return () => {
      active = false;
    };
  }, [artist?.artist]);

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all ${
        isComparison ? 'ring-1 ring-purple-500/20' : ''
      }`}
    >
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="w-40 h-40 rounded-full border-8 border-slate-900 overflow-hidden shadow-2xl bg-slate-800">
            <img
              src={artist.artist_image_url || 'https://via.placeholder.com/400'}
              alt={artist.artist}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mb-4 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-white">{artist.artist}</h2>
              {isDB && (
                <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg text-xs font-black text-slate-900 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  RANK #{artist.global_rank || 'N/A'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-xs">
                <Globe className="w-3 h-3" /> {artist.country || 'International'}
              </span>
              <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-purple-400">
                {artist.genre || 'Various'}
              </span>
            </div>
          </div>
        </div>

        {!isComparison && onCompare && (
          <button
            onClick={onCompare}
            className={`absolute top-6 right-8 px-6 py-2 rounded-xl font-bold transition-all border ${
              isSelected
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-purple-500'
            }`}
          >
            {isSelected ? 'Selectionne' : '+ Comparer'}
          </button>
        )}
      </div>

      <div className="mt-20 p-8 pt-4 space-y-10">
        {artist.bio && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-amber-400">
              <Star className="w-5 h-5" />
              Biographie
            </h3>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative">
              <p
                className="text-slate-300 leading-relaxed max-h-32 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: artist.bio }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 rounded text-[10px] font-black text-amber-500 uppercase tracking-widest">
                Last.fm
              </div>
            </div>
          </div>
        )}

        {bestTracks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-300">
              <PlayCircle className="w-5 h-5" />
              Best Tracks (Last.fm)
            </h3>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
              {bestTracks.map((track, index) => (
                <div
                  key={`${track.name}-${index}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/60"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-500 uppercase">#{index + 1}</p>
                    <p className="text-sm font-semibold text-slate-100 truncate">{track.name}</p>
                  </div>
                  <p className="text-xs font-bold text-cyan-300 whitespace-nowrap">
                    {formatNumber(track.playcount)} plays
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similarArtists.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-300">
              <Users className="w-5 h-5" />
              Artistes similaires (Last.fm)
            </h3>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
              {similarArtists.map((similarArtist, index) => (
                <div
                  key={`similar-${similarArtist.artist || 'artist'}-${index}`}
                  className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/60"
                >
                  <p className="text-xs font-black text-slate-500 uppercase">#{index + 1}</p>
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {similarArtist.artist} - Similarite: {formatSimilarity(similarArtist.match)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: 'Followers',
              value: formatNumber(artist.followers),
              gain: artist.daily_gain_followers,
              color: 'text-purple-400',
              icon: Users,
            },
            {
              label: 'Auditeurs (M)',
              value: formatNumber(artist.listeners),
              gain: artist.monthly_gain_listeners,
              color: 'text-cyan-400',
              icon: Headphones,
            },
            {
              label: 'Streams Totaux',
              value: formatNumber(totalStreams),
              gain: artist.streams_1B > 0 ? 'ELITE' : null,
              color: 'text-pink-400',
              icon: PlayCircle,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl space-y-2 group hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <stat.icon
                  className={`w-5 h-5 ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity`}
                />
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              {stat.gain && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  {typeof stat.gain === 'number' ? `+${formatNumber(stat.gain)}` : stat.gain}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Music className="w-5 h-5 text-slate-500" />
              Repartition des Streams
            </h3>
            <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 flex items-center gap-8 h-48">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">Solo</p>
                  <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${soloPct}%` }} />
                  </div>
                  <p className="text-right text-sm font-bold">{formatNumber(soloStreams)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">Featurings</p>
                  <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${featPct}%` }} />
                  </div>
                  <p className="text-right text-sm font-bold">{formatNumber(featStreams)}</p>
                </div>
              </div>
              <div className="w-1/3 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streamData}>
                    <Bar dataKey="value">
                      <Cell fill={CHART_COLORS[4]} />
                      <Cell fill={CHART_COLORS[2]} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-500" />
              Impact du Catalogue
            </h3>
            <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 grid grid-cols-2 gap-4 h-48">
              {discography.map((item, id) => (
                <div
                  key={id}
                  className="flex flex-col justify-center px-4 bg-slate-900/50 rounded-xl border border-slate-800/50"
                >
                  <span className="text-[10px] text-slate-500 font-black uppercase mb-1">{item.label}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-white">{item.value || 0}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)] ${item.color.replace(
                        'bg-',
                        'shadow-'
                      )}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {artistCountryMapLoading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
              Chargement de la carte geographique...
            </div>
          )}
          <AlbumsChoroplethMap
            data={artistCountryMapData}
            title="Geo Streams Map"
            subtitle={`Pays ou ${artist.artist || 'cet artiste'} est streame`}
            valueField="streams"
            countField="songs_count"
            countLabel="songs"
            valueLabel="streams"
            height={480}
          />
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
