import { notFound } from "next/navigation";
import { db } from "@/db";
import { artists, artistProfiles,Song, songs as songsTable, tracks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SearchableSongsList } from "@/components/artist/searchable-songs-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Music,
  PlayCircle,
  Clock,
  Calendar,
  Disc,
  ListMusic,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
    song: string;
  };
}

async function getArtistBySlug(slug: string) {
  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, slug))
    .limit(1);

  if (!artist) return null;

  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.artistId, artist.id))
    .limit(1);

  if (!profile || !profile.isPublic) return null;

  return { artist, profile };
}

async function getArtistSongs(artistId: string) {
  const artistSongs = await db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.artistId, artistId),
      eq(songsTable.status, "approved")
    ))
    .orderBy(songsTable.createdAt);

  return artistSongs;
}

async function getSongById(songId: string, artistId: string) {
  const [song] = await db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.id, songId),
      eq(songsTable.artistId, artistId),
      eq(songsTable.status, "approved")
    ))
    .limit(1);

  if (!song) return null;

  const songTracks = await db
    .select()
    .from(tracks)
    .where(eq(tracks.songId, song.id))
    .orderBy(tracks.trackNumber);

  return { song, tracks: songTracks };
}

async function getSongByTitle(title: string, artistId: string) {
  // Try to find by title (case-insensitive, URL-safe comparison)
  const artistSongs = await db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.artistId, artistId),
      eq(songsTable.status, "approved")
    ));

  const song = artistSongs.find((s: Song) =>
    s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === title.toLowerCase()
  );

  if (!song) return null;

  const songTracks = await db
    .select()
    .from(tracks)
    .where(eq(tracks.songId, song.id))
    .orderBy(tracks.trackNumber);

  return { song, tracks: songTracks };
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default async function ArtistSongPage({ params }: PageProps) {
  const { slug, song: songParam } = params;

  // Get artist
  const artistData = await getArtistBySlug(slug);
  if (!artistData) {
    notFound();
  }

  const { artist, profile } = artistData;

  // Case 1: List all songs
  if (songParam.toLowerCase() === 'songs') {
    const songs = await getArtistSongs(artist.id);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
          {/* Artist Header */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.picture || ""} />
              <AvatarFallback>
                <Music className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/artists/${slug}`} className="text-sm text-muted-foreground hover:underline">
                ← Back to Profile
              </Link>
              <h1 className="text-3xl font-bold">{artist.displayName}</h1>
              <p className="text-muted-foreground">All Music</p>
            </div>
          </div>

          {/* Searchable Songs List */}
          <SearchableSongsList songs={songs} artistSlug={slug} />
        </div>

        <MobileBottomNav />
      </div>
    );
  }

  // Case 2 & 3: Specific song/album or track
  // Check if it's an album with track number (e.g., "album-id#3")
  const trackMatch = songParam.match(/^(.+)#(\d+)$/);
  let songData;
  let specificTrackNumber: number | null = null;

  if (trackMatch) {
    // Album with specific track number
    const [, songId, trackNum] = trackMatch;
    songData = await getSongById(songId, artist.id);
    specificTrackNumber = parseInt(trackNum);
  } else {
    // Try by ID first, then by title slug
    songData = await getSongById(songParam, artist.id);
    if (!songData) {
      songData = await getSongByTitle(songParam, artist.id);
    }
  }

  if (!songData) {
    notFound();
  }

  const { song, tracks: songTracks } = songData;

  // If specific track requested, find it
  const specificTrack = specificTrackNumber
    ? songTracks.find((t: any) => t.trackNumber === specificTrackNumber)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
        {/* Back Navigation */}
        <Link href={`/artists/${slug}`} className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
          ← Back to {artist.displayName}
        </Link>

        {/* Album/Song Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {song.cover && (
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full md:w-64 h-64 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <Badge className="mb-2">{song.type}</Badge>
                <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
                <p className="text-xl text-muted-foreground mb-4">{artist.displayName}</p>

                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  {song.genre && (
                    <div className="flex items-center gap-1">
                      <Music className="h-4 w-4" />
                      <span>{song.genre}</span>
                    </div>
                  )}
                  {song.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(song.createdAt).getFullYear()}</span>
                    </div>
                  )}
                  {song.numberOfTracks && song.numberOfTracks > 1 && (
                    <div className="flex items-center gap-1">
                      <Disc className="h-4 w-4" />
                      <span>{song.numberOfTracks} tracks</span>
                    </div>
                  )}
                </div>

                {song.upc && (
                  <p className="text-sm text-muted-foreground">UPC: {song.upc}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Track List or Single Track */}
        {specificTrack ? (
          // Specific track from album
          <Card>
            <CardHeader>
              <CardTitle>Track {specificTrack.trackNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{specificTrack.title}</h2>
                  {specificTrack.isrc && (
                    <p className="text-sm text-muted-foreground">ISRC: {specificTrack.isrc}</p>
                  )}
                </div>

                {specificTrack.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(specificTrack.duration)}</span>
                  </div>
                )}

                {specificTrack.leadVocal && (
                  <div>
                    <p className="text-sm font-semibold">Lead Vocal:</p>
                    <p>{specificTrack.leadVocal}</p>
                  </div>
                )}

                {specificTrack.producer && (
                  <div>
                    <p className="text-sm font-semibold">Producer:</p>
                    <p>{specificTrack.producer}</p>
                  </div>
                )}

                {specificTrack.writer && (
                  <div>
                    <p className="text-sm font-semibold">Writer:</p>
                    <p>{specificTrack.writer}</p>
                  </div>
                )}

                {specificTrack.lyrics && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Lyrics:</p>
                    <pre className="whitespace-pre-wrap text-muted-foreground">{specificTrack.lyrics}</pre>
                  </div>
                )}

                {specificTrack.explicit && specificTrack.explicit !== 'no' && (
                  <Badge variant="destructive">Explicit</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ) : songTracks.length > 0 ? (
          // Track list for album
          <Card>
            <CardHeader>
              <CardTitle>Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {songTracks.map((track: any) => (
                  <Link
                    key={track.id}
                    href={`/artists/${slug}/${song.id}#${track.trackNumber}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className="text-muted-foreground w-8 text-center">
                      {track.trackNumber}
                    </span>
                    <PlayCircle className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <h3 className="font-medium">{track.title}</h3>
                      {track.leadVocal && (
                        <p className="text-sm text-muted-foreground">{track.leadVocal}</p>
                      )}
                    </div>
                    {track.duration && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(track.duration)}
                      </span>
                    )}
                    {track.explicit && track.explicit !== 'no' && (
                      <Badge variant="outline" className="text-xs">E</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <MobileBottomNav />
    </div>
  );
}
