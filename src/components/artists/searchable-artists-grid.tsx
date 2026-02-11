"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Music,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  MapPin,
  Disc,
  Users,
  Play,
} from "lucide-react";

interface Artist {
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

interface SearchableArtistsGridProps {
  artists: Artist[];
}

export function SearchableArtistsGrid({ artists }: SearchableArtistsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter artists based on search query
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return artists;

    const query = searchQuery.toLowerCase();
    return artists.filter((artist) => {
      const nameMatch = artist.displayName.toLowerCase().includes(query);
      const genreMatch = artist.genre?.toLowerCase().includes(query);
      const cityMatch = artist.city?.toLowerCase().includes(query);
      const countryMatch = artist.country?.toLowerCase().includes(query);
      const labelMatch = artist.recordLabel?.toLowerCase().includes(query);
      return nameMatch || genreMatch || cityMatch || countryMatch || labelMatch;
    });
  }, [artists, searchQuery]);

  // Separate featured and regular artists
  const featuredArtists = filteredArtists.filter(a => a.isFeatured);
  const regularArtists = filteredArtists.filter(a => !a.isFeatured);

  // Paginate regular artists (featured artists are always shown)
  const totalPages = Math.ceil(regularArtists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegularArtists = regularArtists.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useMemo(() => {
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
            placeholder="Search artists by name, genre, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {(searchQuery || filteredArtists.length > 0) && (
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? `Found ${filteredArtists.length} result${filteredArtists.length !== 1 ? "s" : ""}` : `Showing ${filteredArtists.length} artist${filteredArtists.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            Featured Artists
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={artist.picture || ""} />
                        <AvatarFallback>
                          <Music className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>

                      {/* Name and Badges */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{artist.displayName}</h3>
                        {artist.isVerified && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                        {artist.genre && (
                          <Badge variant="secondary" className="text-xs">
                            {artist.genre}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                          <Star className="h-3 w-3 mr-1 fill-yellow-600" />
                          Featured
                        </Badge>
                      </div>

                      {/* Location */}
                      {(artist.city || artist.country) && (
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[artist.city, artist.country].filter(Boolean).join(", ")}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {artist.totalSongs > 0 && (
                          <span className="flex items-center gap-1">
                            <Disc className="h-3 w-3" />
                            {artist.totalSongs}
                          </span>
                        )}
                        {artist.totalFollowers > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {artist.totalFollowers.toLocaleString()}
                          </span>
                        )}
                        {artist.totalPlays > 0 && (
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {artist.totalPlays.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Regular Artists */}
      {paginatedRegularArtists.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {featuredArtists.length > 0 ? "All Artists" : ""}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedRegularArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <Avatar className="h-20 w-20 mb-4">
                        <AvatarImage src={artist.picture || ""} />
                        <AvatarFallback>
                          <Music className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>

                      {/* Name and Badges */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{artist.displayName}</h3>
                        {artist.isVerified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
                        )}
                      </div>

                      {artist.genre && (
                        <Badge variant="secondary" className="text-xs mb-3">
                          {artist.genre}
                        </Badge>
                      )}

                      {/* Location */}
                      {(artist.city || artist.country) && (
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[artist.city, artist.country].filter(Boolean).join(", ")}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {artist.totalSongs > 0 && (
                          <span className="flex items-center gap-1">
                            <Disc className="h-3 w-3" />
                            {artist.totalSongs}
                          </span>
                        )}
                        {artist.totalFollowers > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {artist.totalFollowers.toLocaleString()}
                          </span>
                        )}
                        {artist.totalPlays > 0 && (
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {artist.totalPlays.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

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
      {filteredArtists.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching artists found" : "No artists available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for new artists"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
