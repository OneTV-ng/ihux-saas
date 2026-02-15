// Simple API client for songs endpoints
export async function fetchArtistSongs({ artistId, search = "", page = 1, pageSize = 10 }: { artistId: string; search?: string; page?: number; pageSize?: number }) {
  const params = new URLSearchParams();
  if (artistId) params.append("artistId", artistId);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));
  const res = await fetch(`/api/artist-songs?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch artist songs");
  return res.json();
}

export async function fetchUserSongs({ search = "", page = 1, pageSize = 10 }) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));
  const res = await fetch(`/api/user-songs?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch user songs");
  return res.json();
}

