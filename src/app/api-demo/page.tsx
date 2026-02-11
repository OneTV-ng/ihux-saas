"use client";

import { useState, useEffect } from "react";
import { DxlApiClient } from "@/lib/dxl-api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Upload, BarChart3, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function DxlApiDemoPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const api = new DxlApiClient({
    baseUrl: '/api/dxl/v3',
    platform: 'web',
    debug: true
  });

  const loadSongs = async () => {
    setLoading(true);
    try {
      const response = await api.listSongs({ page: 1, limit: 10 });
      setApiResponse(response);
      if (response.status) {
        setSongs(response.data.items || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.getDashboardStats();
      setApiResponse(response);
      if (response.status) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateSong = async () => {
    setLoading(true);
    try {
      const response = await api.createSong({
        type: 'single',
        title: 'Test Song ' + new Date().getTime(),
        artist_id: 'test-artist-id',
        genre: 'Afrobeats',
        tracks: [
          {
            title: 'Track 1',
            mp3: 'https://example.com/track.mp3',
            explicit: 'no'
          }
        ]
      });
      setApiResponse(response);
      if (response.status) {
        alert('Song created successfully!');
        loadSongs();
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">DXL Music Hub API v3</h1>
          <p className="text-muted-foreground">
            Demo page for testing the DXL API endpoints
          </p>
          <Badge variant="outline" className="mt-2">
            @= Convention Based API
          </Badge>
        </div>

        {/* API Actions */}
        <Card>
          <CardHeader>
            <CardTitle>API Test Actions</CardTitle>
            <CardDescription>
              Click any button to test the corresponding API endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={loadSongs} disabled={loading}>
              <Music className="h-4 w-4 mr-2" />
              List Songs (@=songs.list)
            </Button>
            <Button onClick={loadStats} disabled={loading} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard Stats (@=admin.dashboard.stats)
            </Button>
            <Button onClick={testCreateSong} disabled={loading} variant="secondary">
              <Upload className="h-4 w-4 mr-2" />
              Create Test Song (@=songs.create)
            </Button>
          </CardContent>
        </Card>

        {/* API Response */}
        {apiResponse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                API Response
                <Badge variant={apiResponse.status ? "default" : "destructive"}>
                  {apiResponse.status ? "Success" : "Error"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Action: {apiResponse.info?.action_requested} | 
                Execution Time: {apiResponse.info?.execution_time_ms}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-sm">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Songs List */}
        {songs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Songs</CardTitle>
              <CardDescription>
                {songs.length} songs loaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {song.cover ? (
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold">{song.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {song.artist_name} • {song.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(song.status)}
                      <Badge variant="outline">{song.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Songs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{stats.songs?.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-bold text-yellow-500">{stats.songs?.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-bold text-green-500">{stats.songs?.approved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flagged</span>
                  <span className="font-bold text-red-500">{stats.songs?.flagged}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{stats.tasks?.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-bold">{stats.tasks?.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-bold">{stats.tasks?.in_progress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-bold">{stats.tasks?.completed}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{stats.alerts?.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-bold">{stats.alerts?.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical</span>
                  <span className="font-bold text-red-500">{stats.alerts?.critical}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentation Link */}
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                View the complete API documentation in the project root
              </p>
              <p className="font-mono text-xs">
                /DXL_API_V3_README.md
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
