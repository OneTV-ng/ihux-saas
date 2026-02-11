import { useCallback, useState } from "react";
import { fetchArtistSongs, fetchUserSongs } from "@/lib/apiClient";

export function useArtistSongs(artistId: string, initialSearch = "", initialPage = 1, initialPageSize = 10) {
  const [songs, setSongs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArtistSongs({ artistId, search, page, pageSize });
      setSongs(data.songs);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || "Failed to load songs");
    } finally {
      setLoading(false);
    }
  }, [artistId, search, page, pageSize]);

  return {
    songs,
    total,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    fetchData,
  };
}

export function useUserSongs(initialSearch = "", initialPage = 1, initialPageSize = 10) {
  const [songs, setSongs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserSongs({ search, page, pageSize });
      setSongs(data.songs);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || "Failed to load songs");
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  return {
    songs,
    total,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    fetchData,
  };
}
