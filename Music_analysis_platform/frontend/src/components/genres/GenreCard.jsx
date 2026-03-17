import React from 'react';
import { Music, Users, Disc, Activity, ExternalLink } from 'lucide-react';

const GenreCard = ({ genre, onClick }) => {
  const totalStreams = 
    Number(genre.total_artist_streams) + 
    Number(genre.total_album_streams) + 
    Number(genre.total_song_streams);

  const formatLargeNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + ' Bn';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + ' Mn';
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
          <Music className="w-5 h-5 text-purple-400" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-1 rounded">
          Genres Analytics
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
        {genre.genre}
      </h3>
      
      <div className="mb-4">
        <p className="text-3xl font-black text-slate-100 italic">
          {formatLargeNumber(totalStreams)}
        </p>
        <p className="text-xs text-slate-500 uppercase font-semibold">Streams Cumulés</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-300 font-medium">{genre.artists_count} Artistes</span>
        </div>
        <div className="flex items-center gap-2">
          <Disc className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-300 font-medium">{genre.total_songs_count} Titres</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500">Top Artiste</span>
            <span className="text-slate-200 font-bold truncate max-w-[120px]">{genre.top_artist || 'N/A'}</span>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default GenreCard;
