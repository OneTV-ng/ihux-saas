"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
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
  Upload,
  Edit,
  TrendingUp,
  Users,
  PlayCircle,
  Image as ImageIcon,
  Newspaper,
  Share2,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Artist {
  id: string;
  userId: string;
  artistName: string;
  displayName: string;
  slug: string;
  bio: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  genre: string | null;
  recordLabel: string | null;
  birthday: string | null;
  contact: any;
  legalId: string | null;
  contract: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    artistId: string;
    picture: string | null;
    thumbnails: any;
    gallery: any;
    socialMedia: any;
    mediaPlatform: any;
    fanNews: any;
    press: any;
    isPublic: boolean;
    isVerified: boolean;
    totalSongs: number;
    totalPlays: number;
    totalFollowers: number;
    createdAt: string;
    updatedAt: string;
  };
}

const ArtistHubPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    fetchSelectedArtist();
  }, []);

  const fetchSelectedArtist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/artist?selected=true");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch artist");
      }

      if (!result.data) {
        // No artist selected, redirect to artist management
        router.push("/desk/artist");
        return;
      }

      setArtist(result.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load artist",
        variant: "destructive",
      });
      router.push("/desk/artist");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageBreadcrumb />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!artist) {
    return null; // Will redirect
  }

  const stats = [
    {
      label: "Total Songs",
      value: artist.profile.totalSongs,
      icon: Music,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      label: "Total Plays",
      value: artist.profile.totalPlays.toLocaleString(),
      icon: PlayCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      label: "Followers",
      value: artist.profile.totalFollowers.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  const quickActions = [
    {
      title: "Upload Music",
      description: "Upload new singles, albums, or medleys",
      icon: Upload,
      href: "/desk/artist/upload",
      color: "text-blue-600",
    },
    {
      title: "Manage Gallery",
      description: "Add photos and media to your profile",
      icon: ImageIcon,
      href: `/desk/artist/gallery`,
      color: "text-purple-600",
    },
    {
      title: "Fan News",
      description: "Post updates and announcements",
      icon: Newspaper,
      href: `/desk/artist/news`,
      color: "text-green-600",
    },
    {
      title: "Social Links",
      description: "Update social media connections",
      icon: Share2,
      href: `/desk/artist/social`,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageBreadcrumb />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
        {/* Artist Header */}
        <Card className="mb-6 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={artist.profile.picture || ""} />
                <AvatarFallback>
                  <Music className="h-12 w-12" />
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
                  <Badge variant="outline">Selected</Badge>
                </div>
                <p className="text-muted-foreground mb-2">@{artist.slug}</p>
                {artist.bio && (
                  <p className="text-sm text-muted-foreground max-w-2xl">{artist.bio}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-sm">
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
                  {artist.gender && (
                    <span className="text-muted-foreground">{artist.gender}</span>
                  )}
                  {artist.city && artist.country && (
                    <span className="text-muted-foreground">📍 {artist.city}, {artist.country}</span>
                  )}
                  {artist.city && !artist.country && (
                    <span className="text-muted-foreground">📍 {artist.city}</span>
                  )}
                  {!artist.city && artist.country && (
                    <span className="text-muted-foreground">📍 {artist.country}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/desk/artist")}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/desk/artist")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Change Artist
                  </Button>
                  <Link href={`/artists/${artist.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <Link href={action.href} key={index}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity / Analytics Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics & Insights
            </CardTitle>
            <CardDescription>Track your artist performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Detailed analytics for plays, followers, revenue, and engagement will be available here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default ArtistHubPage;
