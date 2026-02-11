"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Music,
  Disc,
  ListMusic,
  Calendar,
  ChevronRight,
  Search,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  type: string;
  genre: string | null;
  cover: string | null;
  numberOfTracks: number | null;
  createdAt: Date;
}

interface SearchableSongsListProps {
  songs: Song[];
  artistSlug: string;
}

export function SearchableSongsList({ songs, artistSlug }: SearchableSongsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const genreMatch = song.genre?.toLowerCase().includes(query);
      const typeMatch = song.type.toLowerCase().includes(query);
      return titleMatch || genreMatch || typeMatch;
    });
  }, [songs, searchQuery]);

  // Group filtered songs by type
  const singles = filteredSongs.filter((s) => s.type === "single");
  const albums = filteredSongs.filter((s) => s.type === "album");
  const medleys = filteredSongs.filter((s) => s.type === "medley");

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search songs, albums, or by genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {filteredSongs.length} result{filteredSongs.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Singles */}
      {singles.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Singles {searchQuery && `(${singles.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {singles.map((single) => (
                <Link
                  key={single.id}
                  href={`/artists/${artistSlug}/${single.id}`}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                >
                  {single.cover && (
                    <img
                      src={single.cover}
                      alt={single.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{single.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {single.genre && <span>{single.genre}</span>}
                      {single.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(single.createdAt).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc className="h-5 w-5" />
              Albums & EPs {searchQuery && `(${albums.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/artists/${artistSlug}/${album.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {album.cover && (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={album.cover}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-1">{album.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {album.numberOfTracks && (
                          <span>{album.numberOfTracks} tracks</span>
                        )}
                        {album.createdAt && (
                          <span>• {new Date(album.createdAt).getFullYear()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medleys */}
      {medleys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListMusic className="h-5 w-5" />
              Medleys {searchQuery && `(${medleys.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medleys.map((medley) => (
                <Link
                  key={medley.id}
                  href={`/artists/${artistSlug}/${medley.id}`}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                >
                  {medley.cover && (
                    <img
                      src={medley.cover}
                      alt={medley.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{medley.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {medley.numberOfTracks} tracks
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredSongs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching songs found" : "No Music Yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "This artist hasn't released any music yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
