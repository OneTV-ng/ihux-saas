"use client";

import { useState, useMemo, useEffect } from "react";
import { SongQuickViewModal } from "@/components/songs/song-quick-view-modal";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Music,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Disc,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  type: string;
  genre: string | null;
  cover: string | null;
  numberOfTracks: number | null;
  isFeatured: boolean;
  createdAt: Date;
  artistSlug: string;
  artistDisplayName: string;
}

interface SearchableSongsGridProps {
  songs: Song[];
}
export function SearchableSongsGrid({ songs }: SearchableSongsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewSong, setQuickViewSong] = useState<Song | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 12;

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const artistMatch = song.artistDisplayName.toLowerCase().includes(query);
      const genreMatch = song.genre?.toLowerCase().includes(query);
      const typeMatch = song.type.toLowerCase().includes(query);
      return titleMatch || artistMatch || genreMatch || typeMatch;
    });
  }, [songs, searchQuery]);

  // Separate featured and regular songs
  const featuredSongs = filteredSongs.filter(s => s.isFeatured);
  const regularSongs = filteredSongs.filter(s => !s.isFeatured);

  // Paginate regular songs (featured songs are always shown)
  const totalPages = Math.ceil(regularSongs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegularSongs = regularSongs.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search songs by title, artist, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {(searchQuery || filteredSongs.length > 0) && (
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? `Found ${filteredSongs.length} result${filteredSongs.length !== 1 ? "s" : ""}` : `Showing ${filteredSongs.length} song${filteredSongs.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Featured Songs
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredSongs.map((song) => (
              <div
                key={song.id}
                className="group cursor-pointer"
                onClick={() => {
                  setQuickViewSong(song);
                  setModalOpen(true);
                }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {song.cover ? (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Music className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {song.type}
                      </Badge>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                        Featured
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{song.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {song.artistDisplayName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {song.genre && (
                        <span className="flex items-center gap-1">
                          <Music className="h-3 w-3" />
                          {song.genre}
                        </span>
                      )}
                      {song.numberOfTracks && song.numberOfTracks > 1 && (
                        <span className="flex items-center gap-1">
                          <Disc className="h-3 w-3" />
                          {song.numberOfTracks} tracks
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Songs */}
      {paginatedRegularSongs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {featuredSongs.length > 0 ? "All Songs" : ""}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedRegularSongs.map((song) => (
              <div
                key={song.id}
                className="group cursor-pointer"
                onClick={() => {
                  setQuickViewSong(song);
                  setModalOpen(true);
                }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {song.cover ? (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Music className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <Badge variant="secondary" className="capitalize mb-2">
                      {song.type}
                    </Badge>
                    <h3 className="font-semibold mb-1 line-clamp-1">{song.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {song.artistDisplayName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {song.genre && (
                        <span className="flex items-center gap-1">
                          <Music className="h-3 w-3" />
                          {song.genre}
                        </span>
                      )}
                      {song.numberOfTracks && song.numberOfTracks > 1 && (
                        <span className="flex items-center gap-1">
                          <Disc className="h-3 w-3" />
                          {song.numberOfTracks} tracks
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Song Quick View Modal */}
          <SongQuickViewModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            song={quickViewSong ? {
              ...quickViewSong,
              genre: quickViewSong.genre ?? undefined,
              cover: quickViewSong.cover ?? undefined,
              numberOfTracks: quickViewSong.numberOfTracks ?? undefined
            } : null}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {filteredSongs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching songs found" : "No songs available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for new music"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
