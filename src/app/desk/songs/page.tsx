"use client";

import { useEffect, useState } from "react";
import { useUserSongs } from "@/hooks/useSongs";
import { Song } from "@/db/schema";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SongDetailsModal } from "@/components/admin/song-details-modal";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Play,
  Heart,
  MoreVertical,
  Music,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
} from "lucide-react";
import { mobileApi } from "@/lib/mobile-api-client";

interface Track {
  id: string;
  title: string;
  duration?: number;
  isrc?: string;
  explicit?: string;
}

const ExploreSongsPage = () => {
  const {
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
  } = useUserSongs();

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, pageSize]);

  const handleViewSongDetails = async (song: Song) => {
    try {
      setLoadingTracks(true);
      setSelectedSong(song);

      // Fetch full song details with tracks
      const response = await mobileApi.songs.getSong(song.id);

      if (response.success) {
        const data = response.data as any;
        setSelectedTracks(data?.tracks || []);
      } else {
        setSelectedTracks([]);
      }

      setModalOpen(true);
    } catch (err) {
      console.error("Error loading song details:", err);
      setModalOpen(true);
    } finally {
      setLoadingTracks(false);
    }
  };

  const SongCard = ({ song }: { song: Song }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Cover Image with Hover Overlay */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted cursor-pointer">
            {(song as any).cover ? (
              <img
                src={(song as any).cover}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
                <Music className="h-8 w-8 text-primary" />
              </div>
            )}

            {/* Hover Overlay */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleViewSongDetails(song);
              }}
              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex items-center justify-center"
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{song.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{song.artistName}</p>
            <div className="flex items-center gap-3 mt-1">
              {(song as any).genre && (
                <Badge variant="secondary" className="text-xs">
                  {(song as any).genre}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Play className="h-3 w-3" />
                {song?.plays?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {song.duration
              ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "0:00"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {song.releaseDate
              ? new Date(song.releaseDate).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Songs</h1>
          <p className="text-muted-foreground">
            Browse and discover all songs across your artist profiles
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search songs, artists, albums..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="chill">Chill</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Songs</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                All Songs ({songs.length})
              </h2>
            </div>
            <div className="grid gap-4">
              {loading && (
                <div className="text-center py-8">Loading...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-500">{error}</div>
              )}
              {!loading && !error && songs.length === 0 && (
                <div className="text-center py-8">No songs found.</div>
              )}
              {songs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recently Added</h2>
            </div>
            <div className="grid gap-4">
              {songs.slice(0, 3).map((song: Song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Songs
              </h2>
            </div>
            <div className="grid gap-4">
              {[...songs]
                .sort((a, b) => (b.plays || 0) - (a.plays || 0))
                .slice(0, 3)
                .map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start adding songs to your favorites to see them here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Song Details Modal */}
      {selectedSong && (
        <SongDetailsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          song={selectedSong as any}
          tracks={selectedTracks}
          onCopy={(text, label) => {
            navigator.clipboard.writeText(text);
          }}
        />
      )}

      <MobileBottomNav />
    </div>
  );
};

export default ExploreSongsPage;
