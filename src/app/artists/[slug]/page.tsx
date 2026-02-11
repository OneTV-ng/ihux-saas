"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SearchableArtistsGrid } from "@/components/artists/searchable-artists-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Music,
  PlayCircle,
  Users,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Newspaper,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import Link from "next/link";

interface Artist {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  genre: string | null;
  recordLabel: string | null;
  profile: {
    picture: string | null;
    thumbnails: any;
    gallery: Array<{
      url: string;
      title?: string;
      description?: string;
      order?: number;
    }> | null;
    mediaPlatform: {
      spotify?: string;
      appleMusic?: string;
      youtube?: string;
      soundcloud?: string;
      tidal?: string;
      deezer?: string;
      amazonMusic?: string;
    } | null;
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      website?: string;
    } | null;
    fanNews: Array<{
      id: string;
      title: string;
      content: string;
      image?: string;
      publishedAt: string;
    }> | null;
    press: Array<{
      id: string;
      title: string;
      publication?: string;
      url?: string;
      image?: string;
      publishedAt: string;
    }> | null;
    isPublic: boolean;
    isVerified: boolean;
    totalSongs: number;
    totalPlays: number;
    totalFollowers: number;
  };
}

interface SearchArtist {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  genre: string | null;
  recordLabel: string | null;
  picture: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  totalSongs: number;
  totalPlays: number;
  totalFollowers: number;
  createdAt: Date;
}

const ArtistPublicProfile = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchArtist[]>([]);

  useEffect(() => {
    fetchArtistProfile();
    checkOwnership();
  }, [slug]);

  const fetchArtistProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSearchResults([]);

      const response = await fetch(`/api/artists/${slug}`);
      const result = await response.json();

      if (!response.ok) {
        // Artist not found, search for similar artists
        await searchForArtists(slug);
        throw new Error(result.error || "Artist not found");
      }

      setArtist(result.data);
    } catch (error: any) {
      setError(error.message || "Failed to load artist profile");
    } finally {
      setIsLoading(false);
    }
  };

  const searchForArtists = async (query: string) => {
    try {
      const response = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.data || []);
      }
    } catch (error) {
      console.error("Error searching for artists:", error);
    }
  };

  const checkOwnership = async () => {
    try {
      // Check if user owns this artist
      const response = await fetch("/api/artist");
      if (response.ok) {
        const result = await response.json();
        const userArtists = result.data?.artists || [];
        const ownsArtist = userArtists.some((a: any) => a.slug === slug);
        setIsOwner(ownsArtist);
      }
    } catch (error) {
      // User not authenticated or error checking
      setIsOwner(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !artist || !artist.profile.isPublic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-7xl">
          {/* Not Found Message */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Artist "{slug}" Not Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find an artist with that name, but here are some similar results:
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Similar Artists</h2>
              <SearchableArtistsGrid artists={searchResults} />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Similar Artists Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try searching from the artists page or browse all artists.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/artists">
                      <Button>Browse All Artists</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline">Go Home</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const stats = [
    {
      label: "Songs",
      value: artist.profile.totalSongs,
      icon: Music,
      color: "text-blue-600",
    },
    {
      label: "Plays",
      value: artist.profile.totalPlays.toLocaleString(),
      icon: PlayCircle,
      color: "text-green-600",
    },
    {
      label: "Followers",
      value: artist.profile.totalFollowers.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
        {/* Artist Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={artist.profile.picture || ""} />
                <AvatarFallback>
                  <Music className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{artist.displayName}</h1>
                  {artist.profile.isVerified && (
                    <Badge className="bg-blue-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-3 text-sm">
                  {artist.genre && (
                    <Badge variant="secondary" className="font-normal">
                      🎵 {artist.genre}
                    </Badge>
                  )}
                  {artist.recordLabel && (
                    <Badge variant="outline" className="font-normal">
                      🏢 {artist.recordLabel}
                    </Badge>
                  )}
                  {(artist.city || artist.country) && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {artist.city && artist.country
                        ? `${artist.city}, ${artist.country}`
                        : artist.city || artist.country}
                    </span>
                  )}
                </div>

                {artist.bio && (
                  <p className="text-muted-foreground max-w-2xl mb-4">{artist.bio}</p>
                )}

                {/* Edit Button for Owner */}
                {isOwner && (
                  <div className="mb-4">
                    <Link href="/desk/artist">
                      <Button variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="font-semibold">{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Media Platforms */}
          {artist.profile.mediaPlatform && Object.keys(artist.profile.mediaPlatform).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Listen On
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {artist.profile.mediaPlatform.spotify && (
                    <a
                      href={artist.profile.mediaPlatform.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Spotify</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.mediaPlatform.appleMusic && (
                    <a
                      href={artist.profile.mediaPlatform.appleMusic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Apple Music</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.mediaPlatform.youtube && (
                    <a
                      href={artist.profile.mediaPlatform.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">YouTube</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.mediaPlatform.soundcloud && (
                    <a
                      href={artist.profile.mediaPlatform.soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">SoundCloud</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {artist.profile.socialMedia && Object.keys(artist.profile.socialMedia).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {artist.profile.socialMedia.instagram && (
                    <a
                      href={artist.profile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Instagram</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.socialMedia.twitter && (
                    <a
                      href={artist.profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Twitter</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.socialMedia.facebook && (
                    <a
                      href={artist.profile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Facebook</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.socialMedia.tiktok && (
                    <a
                      href={artist.profile.socialMedia.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">TikTok</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {artist.profile.socialMedia.website && (
                    <a
                      href={artist.profile.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="font-medium">Official Website</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gallery */}
        {artist.profile.gallery && artist.profile.gallery.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artist.profile.gallery
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={item.url}
                        alt={item.title || `Gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      {item.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm">
                          {item.title}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fan News */}
        {artist.profile.fanNews && artist.profile.fanNews.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Latest News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artist.profile.fanNews
                  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                  .slice(0, 5)
                  .map((news) => (
                    <div key={news.id} className="border-b pb-4 last:border-0">
                      {news.image && (
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
                      <p className="text-muted-foreground mb-2">{news.content}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(news.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Press */}
        {artist.profile.press && artist.profile.press.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Press & Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {artist.profile.press
                  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                  .map((press) => (
                    <a
                      key={press.id}
                      href={press.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                      {press.image && (
                        <img
                          src={press.image}
                          alt={press.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{press.title}</h4>
                        {press.publication && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {press.publication}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(press.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default ArtistPublicProfile;
