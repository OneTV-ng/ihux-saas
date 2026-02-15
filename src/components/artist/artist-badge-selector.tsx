"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, CheckCircle2, Music, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Artist {
  id: string;
  artistName: string;
  displayName: string;
  slug: string;
  isActive: boolean;
  profile?: {
    picture?: string | null;
    isVerified?: boolean;
  };
}

interface ArtistBadgeSelectorProps {
  selectedArtist: Artist | null;
  artists: Artist[];
  isLoading?: boolean;
  onSelectArtist?: (artist: Artist) => void;
  showVerificationWarning?: boolean;
  isUserVerified?: boolean;
}

export function ArtistBadgeSelector({
  selectedArtist,
  artists,
  isLoading = false,
  onSelectArtist,
  showVerificationWarning = false,
  isUserVerified = false,
}: ArtistBadgeSelectorProps) {
  const router = useRouter();
  const [activeArtist, setActiveArtist] = useState<Artist | null>(selectedArtist);

  useEffect(() => {
    setActiveArtist(selectedArtist);
  }, [selectedArtist]);

  const handleSelectArtist = async (artist: Artist) => {
    setActiveArtist(artist);
    if (onSelectArtist) {
      onSelectArtist(artist);
    } else {
      // Set as selected artist via API
      try {
        const res = await fetch("/api/artist/select", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistId: artist.id }),
        });
        if (res.ok) {
          setActiveArtist(artist);
        }
      } catch (error) {
        console.error("Error selecting artist:", error);
      }
    }
  };

  const handleCreateArtist = () => {
    router.push("/desk/artist?tab=create");
  };

  if (!selectedArtist) {
    return (
      <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-100">No Artist Selected</p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Create or select an artist to start uploading music
              </p>
            </div>
            <Button
              onClick={handleCreateArtist}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Create Artist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {showVerificationWarning && !isUserVerified && (
        <Card className="border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-100">Email Not Verified</p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Please verify your email before uploading music
                </p>
              </div>
              <Button
                onClick={() => router.push("/desk/settings")}
                size="sm"
                variant="outline"
                className="border-red-300 dark:border-red-700"
              >
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 rounded-xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            disabled={isLoading}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeArtist?.profile?.picture || ""} />
                <AvatarFallback className="bg-green-500/20 text-green-700 dark:text-green-400">
                  <Music className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {activeArtist?.displayName || activeArtist?.artistName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeArtist?.profile?.isVerified ? "✓ Verified" : "Not verified"}
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider">
            Your Artists ({artists.length})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {artists.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              <p className="mb-2">No artists created yet</p>
              <Button
                onClick={handleCreateArtist}
                size="sm"
                variant="ghost"
                className="w-full"
              >
                Create Your First Artist
              </Button>
            </div>
          ) : (
            artists.map((artist) => (
              <DropdownMenuItem
                key={artist.id}
                onClick={() => handleSelectArtist(artist)}
                className="cursor-pointer flex items-center gap-2 py-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={artist.profile?.picture || ""} />
                  <AvatarFallback className="bg-green-500/20 text-green-700 dark:text-green-400 text-xs">
                    <Music className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {artist.displayName || artist.artistName}
                  </p>
                  {artist.profile?.isVerified && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>
                {activeArtist?.id === artist.id && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCreateArtist}
            className="cursor-pointer text-green-600 dark:text-green-400 font-medium"
          >
            + Create New Artist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeArtist && !activeArtist.isActive && (
        <Card className="border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              ⚠️ This artist is inactive. Activate to start uploading.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
