"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  ChevronRight,
  AlertCircle,
  Loader,
  Plus,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import { mobileApi } from "@/lib/mobile-api-client";

interface Song {
  id: string;
  title: string;
  artistName: string;
  status: string;
  genre?: string;
  createdAt?: string;
  plays?: number;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSongs();
  }, [page]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getSongs(page, 20);

      if (response.success) {
        const data = response.data as any;
        setSongs(data?.songs || []);
      } else {
        setError(response.error || "Failed to load songs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load songs");
      console.error("Songs load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-purple-100 text-purple-800";
      case "flagged":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Music className="w-8 h-8 text-primary" />
            Songs Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage, review, and publish music on the platform
          </p>
        </div>
        <Link href="/admin/upload">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Upload New Song
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading songs</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSongs}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No songs yet</p>
            <p className="text-muted-foreground mb-4">
              Get started by uploading your first song
            </p>
            <Link href="/admin/upload">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Song
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <Card key={song.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {song.artistName}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge
                            className={getStatusColor(song.status)}
                            variant="secondary"
                          >
                            {song.status}
                          </Badge>
                          {song.genre && (
                            <Badge variant="outline">{song.genre}</Badge>
                          )}
                          {song.plays && (
                            <Badge variant="outline">{song.plays} plays</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && songs.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">Page {page}</span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
