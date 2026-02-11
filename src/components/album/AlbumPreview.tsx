import React from "react";

interface TrackInfo {
  title: string;
  artist: string;
  isrc?: string;
}

interface AlbumPreviewProps {
  coverUrl: string;
  albumName: string;
  upc?: string;
  tracks: TrackInfo[];
}

export const AlbumPreview: React.FC<AlbumPreviewProps> = ({ coverUrl, albumName, upc, tracks }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-64 h-64 bg-gray-200 rounded-lg overflow-hidden shadow">
        {coverUrl ? (
          <img src={coverUrl} alt="Album Cover" className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Cover Art</div>
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-2">{albumName || "Album Name"}</h2>
        {upc && <div className="text-sm text-muted-foreground mb-2">UPC: {upc}</div>}
        <ul className="divide-y divide-gray-200">
          {tracks.map((track, idx) => (
            <li key={idx} className="py-2 flex flex-col">
              <span className="font-medium">{track.title}</span>
              <span className="text-sm text-muted-foreground">{track.artist}</span>
              {track.isrc && <span className="text-xs text-gray-500">ISRC: {track.isrc}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
