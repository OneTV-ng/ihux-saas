import React, { useState } from "react";
import { AlbumPreview } from "@/components/album/AlbumPreview";

interface TrackInfo {
  title: string;
  artist: string;
  isrc?: string;
}

export default function SingleUpload() {
  const [coverUrl, setCoverUrl] = useState("");
  const [mp3Url, setMp3Url] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [upc, setUpc] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isrc, setIsrc] = useState("");
  const [rejectionFlag, setRejectionFlag] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setCoverUrl(data.url);
    setRejectionFlag(data.rejectionFlag);
    setRejectionReasons(data.rejectionReasons || []);
  };

  const handleMp3Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "audio");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setMp3Url(data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const songData = {
      albumName,
      upc,
      tracks: [{ title: trackTitle, artist, isrc }],
      coverUrl,
      mp3Url,
      rejectionFlag,
      rejectionReasons,
    };
    const res = await fetch("/api/song-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(songData),
    });
    const data = await res.json();
    // Handle response (show success/error)
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label>Album Name</label>
        <input type="text" value={albumName} onChange={e => setAlbumName(e.target.value)} className="input" />
      </div>
      <div>
        <label>UPC</label>
        <input type="text" value={upc} onChange={e => setUpc(e.target.value)} className="input" />
      </div>
      <div>
        <label>Cover Art</label>
        <input type="file" accept="image/*" onChange={handleCoverUpload} />
        {rejectionFlag && (
          <div className="text-red-500 mt-2">
            Rejection Issues:
            <ul>
              {rejectionReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
            </ul>
          </div>
        )}
      </div>
      <div>
        <label>MP3 File</label>
        <input type="file" accept="audio/mp3,audio/mpeg" onChange={handleMp3Upload} />
      </div>
      <div>
        <label>Song Title</label>
        <input type="text" value={trackTitle} onChange={e => setTrackTitle(e.target.value)} className="input" />
      </div>
      <div>
        <label>Artist</label>
        <input type="text" value={artist} onChange={e => setArtist(e.target.value)} className="input" />
      </div>
      <div>
        <label>ISRC</label>
        <input type="text" value={isrc} onChange={e => setIsrc(e.target.value)} className="input" />
      </div>
      <AlbumPreview coverUrl={coverUrl} albumName={albumName} upc={upc} tracks={[{ title: trackTitle, artist, isrc }]} />
      <button type="submit" className="btn btn-primary">Submit Song</button>
    </form>
  );
}
