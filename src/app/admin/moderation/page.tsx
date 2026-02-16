"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  Music,
} from "lucide-react";
import { mobileApi } from "@/lib/mobile-api-client";

interface FlaggedSong {
  id: string;
  title: string;
  artistName: string;
  status: string;
  flagReason?: string;
  flagCategories?: string[];
  flaggedAt?: string;
  flaggedBy?: string;
}

export default function AdminModerationPage() {
  const [songs, setSongs] = useState<FlaggedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadFlaggedSongs();
  }, []);

  const loadFlaggedSongs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getSongs(1, 100);

      if (response.success) {
        const data = response.data as any;
        const allSongs = data?.songs || [];
        // Filter for flagged songs
        const flagged = allSongs.filter(
          (s: any) => s.status === "flagged" || s.status === "rejected"
        );
        setSongs(flagged);
      } else {
        setError(response.error || "Failed to load flagged songs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load songs");
      console.error("Moderation load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (songId: string) => {
    try {
      setActionLoading(songId);
      const response = await mobileApi.admin.updateSongStatus(songId, {
        status: "approved",
      });

      if (response.success) {
        setSongs((prev) => prev.filter((s) => s.id !== songId));
      } else {
        alert(response.error || "Failed to approve song");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve song");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (songId: string) => {
    try {
      setActionLoading(songId);
      const response = await mobileApi.admin.rejectSong(
        songId,
        "Content review - rejected by moderator"
      );

      if (response.success) {
        setSongs((prev) => prev.filter((s) => s.id !== songId));
      } else {
        alert(response.error || "Failed to reject song");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject song");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="w-8 h-8 text-destructive" />
          Moderation Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and take action on flagged or rejected content
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading flagged songs</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFlaggedSongs}
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
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-900 mb-2">
              All Clear!
            </p>
            <p className="text-green-700">
              No flagged or rejected songs at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <Card key={song.id} className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Song Info */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                          <Music className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-red-900">
                            {song.title}
                          </h3>
                          <p className="text-sm text-red-700">
                            {song.artistName}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="destructive">
                              {song.status}
                            </Badge>
                            {song.flaggedAt && (
                              <span className="text-xs text-red-600">
                                {new Date(song.flaggedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flag Info */}
                  {song.flagReason && (
                    <div className="bg-white rounded p-3 border border-red-200">
                      <p className="text-xs font-semibold text-red-900 mb-1">
                        Flag Reason:
                      </p>
                      <p className="text-sm text-red-700">{song.flagReason}</p>
                      {song.flagCategories && song.flagCategories.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {song.flagCategories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(song.id)}
                      disabled={actionLoading === song.id}
                      className="gap-2"
                    >
                      {actionLoading === song.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(song.id)}
                      disabled={actionLoading === song.id}
                      className="gap-2"
                    >
                      {actionLoading === song.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
