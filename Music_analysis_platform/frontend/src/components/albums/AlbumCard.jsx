import React from 'react';
import { formatNumber } from '../../utils/format';
import { ExternalLink } from 'lucide-react';

const AlbumCard = ({ album }) => {
  return (
    <div className="group bg-white dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={album.album_image_url || 'https://via.placeholder.com/300?text=No+Cover'} 
          alt={album.album_title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a 
              href={`https://open.spotify.com/album/${album.album_spotify_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-primary-light rounded-full text-black hover:scale-110 transition-transform"
            >
              <ExternalLink size={20} />
            </a>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-bold text-sm truncate" title={album.album_title}>
            {album.album_title}
          </h3>
          <p className="text-xs text-slate-500 truncate">{album.artist}</p>
        </div>
        
        <div className="flex justify-between items-end pt-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {album.release_year_albums} • {album.genre}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#1DB954]">
              {formatNumber(album.streams_albums)}
            </p>
            <p className="text-[10px] text-slate-500">streams</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
