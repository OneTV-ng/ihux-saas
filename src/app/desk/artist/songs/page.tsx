"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useArtistSongs } from "@/hooks/useSongs";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Search,
  MoreVertical,
  Play,
  Edit,
  Trash2,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";

const ArtistSongsPage = () => {
  const router = useRouter();
  const { defaultArtist, isAuthenticated, isLoading, user } = useAuth();
  const artistId = defaultArtist?.id || "";
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
  } = useArtistSongs(artistId);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/desk/artist/songs");
      return;
    }
    if (user && user.isUserVerified === false) {
      router.replace("/desk/profile#verification");
      return;
    }
    if (!artistId) {
      router.replace("/desk/artist?redirect=/desk/artist/songs");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId, search, page, pageSize, isAuthenticated, isLoading, user]);

  const totalSongs = total;
  const totalPlays = songs.reduce((sum, s) => sum + (s.plays || 0), 0);
  const stats = [
    { label: "Total Songs", value: totalSongs, icon: Music },
    { label: "Total Plays", value: totalPlays.toLocaleString(), icon: Play },
    { label: "Total Views", value: "0", icon: Eye },
    { label: "Total Downloads", value: "0", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-2 sm:px-4 py-6 pb-24 md:pb-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Songs</h1>
          <p className="text-muted-foreground">
            Manage your music catalog and track performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <IconComponent className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Songs Table */}
        <Card className="overflow-x-auto">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Track List</CardTitle>
                <CardDescription>
                  All songs from your current artist profile
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search songs..."
                    className="pl-10 w-full sm:w-[250px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button>
                  <Music className="mr-2 h-4 w-4" />
                  Add Song
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Album</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  )}
                  {error && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">{error}</TableCell>
                    </TableRow>
                  )}
                  {!loading && !error && songs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No songs found.</TableCell>
                    </TableRow>
                  )}
                  {songs.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
                            <Music className="h-5 w-5 text-primary" />
                          </div>
                          {song.title}
                        </div>
                      </TableCell>
                      <TableCell>{song.album}</TableCell>
                      <TableCell>{song.releaseDate}</TableCell>
                      <TableCell>{song.duration}</TableCell>
                      <TableCell className="text-right">
                        {song.plays.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            song.status === "published" ? "default" : "secondary"
                          }
                        >
                          {song.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Play
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ArtistSongsPage;
