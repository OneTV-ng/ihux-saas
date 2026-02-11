"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Music,
  Eye,
  Upload as UploadIcon,
  PauseCircle,
  Disc,
  Layers,
  Video as VideoIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  contact: {
    mobile?: string;
    whatsapp?: string;
    address?: string;
  } | null;
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

interface ArtistData {
  artists: Artist[];
  selectedArtist: Artist | null;
  canCreate: {
    canCreate: boolean;
    currentCount: number;
    maxCount: number;
    reason?: string;
  };
}

const ArtistManagementPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteArtistId, setDeleteArtistId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    artistName: "",
    displayName: "",
    bio: "",
    gender: "",
    city: "",
    country: "",
    genre: "",
    recordLabel: "",
    picture: "",
  });

  // Fetch artists
  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/artist");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch artists");
      }

      setArtistData(result.data);

      // If no artists and can create, show create form
      if (result.data.artists.length === 0 && result.data.canCreate.canCreate) {
        setShowCreateForm(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load artists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // Handle create artist
  const handleCreateArtist = async () => {
    if (!formData.artistName || !formData.displayName) {
      toast({
        title: "Validation Error",
        description: "Artist name and display name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create artist");
      }

      toast({
        title: "Success",
        description: "Artist created successfully",
      });

      setFormData({ artistName: "", displayName: "", bio: "", gender: "", city: "", country: "", genre: "", recordLabel: "", picture: "" });
      setShowCreateForm(false);
      fetchArtists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create artist",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update artist
  const handleUpdateArtist = async () => {
    if (!editingArtist) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/artist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingArtist.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update artist");
      }

      toast({
        title: "Success",
        description: "Artist updated successfully",
      });

      setShowEditForm(false);
      setEditingArtist(null);
      fetchArtists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update artist",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete artist
  const handleDeleteArtist = async (artistId: string) => {
    try {
      const response = await fetch(`/api/artist?id=${artistId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete artist");
      }

      toast({
        title: "Success",
        description: "Artist deleted successfully",
      });

      setDeleteArtistId(null);
      fetchArtists();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete artist",
        variant: "destructive",
      });
    }
  };

  // Handle select artist
  const handleSelectArtist = async (artistId: string) => {
    try {
      const response = await fetch("/api/artist/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to select artist");
      }
      toast({
        title: "Success",
        description: "Artist selected successfully",
      });
      router.push("/desk/artist/hub");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to select artist",
        variant: "destructive",
      });
    }
  };

  // Handle suspend artist
  const handleSuspendArtist = async (artistId: string) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/artist/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });
      if (!response.ok) throw new Error("Failed to suspend artist");
      toast({ title: "Artist suspended" });
      fetchArtists();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing artist
  const startEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      artistName: artist.artistName,
      displayName: artist.displayName,
      bio: artist.bio || "",
      gender: artist.gender || "",
      city: artist.city || "",
      country: artist.country || "",
      genre: artist.genre || "",
      recordLabel: artist.recordLabel || "",
      picture: artist.profile.picture || "",
    });
    setShowEditForm(true);
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


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageBreadcrumb />
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
        <Tabs defaultValue={artistData?.artists.length ? "artists" : "create"} className="space-y-6">
          <TabsList className="mb-6">
            <TabsTrigger value="artists">My Artists</TabsTrigger>
            <TabsTrigger value="create">Create New Artist</TabsTrigger>
          </TabsList>
          <TabsContent value="artists">
            {artistData && artistData.artists.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {artistData.artists.map((artist) => {
                  const isSelected = artistData.selectedArtist?.id === artist.id;
                  return (
                    <Card key={artist.id} className={isSelected ? "border-primary border-2" : ""}>
                      <CardContent className="pt-6">
                        <div
                          className="flex items-start gap-4 cursor-pointer group"
                          onClick={() => handleSelectArtist(artist.id)}
                          title="Click to select artist"
                          tabIndex={0}
                          role="button"
                          aria-label={`Select artist ${artist.displayName}`}
                        >
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={artist.profile.picture || ""} />
                            <AvatarFallback>
                              <Music className="h-8 w-8" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{artist.displayName}</h3>
                              {artist.profile.isVerified && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              @{artist.slug}
                            </p>
                            {isSelected && (
                              <Badge className="mt-2" variant="default">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Selected
                              </Badge>
                            )}
                            {artist.bio && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {artist.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>{artist.profile.totalSongs} songs</span>
                              <span>{artist.profile.totalFollowers} followers</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={e => { e.stopPropagation(); handleSelectArtist(artist.id); }}
                                title="Select Artist"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={e => { e.stopPropagation(); router.push(`/desk/artist/profile?edit=${artist.id}`); }}
                                title="Edit Artist"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={e => { e.stopPropagation(); router.push(`/desk/artist/hub?artist=${artist.id}`); }}
                                title="View Artist Hub"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={e => { e.stopPropagation(); setDeleteArtistId(artist.id); }}
                                title="Delete Artist"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={e => { e.stopPropagation(); handleSuspendArtist(artist.id); }}
                                disabled={isSaving}
                                title="Suspend Artist"
                              >
                                <PauseCircle className="h-4 w-4 text-yellow-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Artists Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first artist profile to start uploading music
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="create">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Artist</CardTitle>
                <CardDescription>Add a new artist profile to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="artistName">Artist Name (URL) *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    placeholder="artist-name"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be used in the URL: /artists/{formData.artistName || "artist-name"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Artist Display Name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about this artist..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      placeholder="e.g., Male, Female, Non-binary"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="e.g., Pop, Rock, Hip-Hop"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Los Angeles"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g., United States"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="recordLabel">Record Label</Label>
                  <Input
                    id="recordLabel"
                    value={formData.recordLabel}
                    onChange={(e) => setFormData({ ...formData, recordLabel: e.target.value })}
                    placeholder="e.g., Universal Music, Independent"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateArtist} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Artist"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteArtistId} onOpenChange={() => setDeleteArtistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this artist profile and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteArtistId && handleDeleteArtist(deleteArtistId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Button and Sub-menu */}
      <div className="fixed bottom-24 right-8 z-40 flex flex-col items-end gap-3">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-br from-green-400 to-green-600 text-black hover:from-green-500 hover:to-green-700"
          onClick={() => artistData?.selectedArtist && router.push('/desk/artist/upload')}
          disabled={!artistData?.selectedArtist}
        >
          <UploadIcon className="h-6 w-6 mr-2" />
          Upload
        </Button>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="rounded-full bg-zinc-900/80 border border-green-400 text-green-400 hover:bg-green-900/40"
            onClick={() => artistData?.selectedArtist && router.push('/desk/artist/upload/single')}
            disabled={!artistData?.selectedArtist}
            title="Upload Single"
          >
            <Disc className="h-4 w-4" />
            <span className="ml-1">Single</span>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-zinc-900/80 border border-green-400 text-green-400 hover:bg-green-900/40"
            onClick={() => artistData?.selectedArtist && router.push('/desk/artist/upload/album')}
            disabled={!artistData?.selectedArtist}
            title="Upload Album"
          >
            <Layers className="h-4 w-4" />
            <span className="ml-1">Album</span>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-zinc-900/80 border border-green-400 text-green-400 hover:bg-green-900/40"
            onClick={() => artistData?.selectedArtist && router.push('/desk/artist/upload/medley')}
            disabled={!artistData?.selectedArtist}
            title="Upload Medley"
          >
            <Music className="h-4 w-4" />
            <span className="ml-1">Medley</span>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-zinc-900/80 border border-green-400 text-green-400 hover:bg-green-900/40"
            onClick={() => artistData?.selectedArtist && router.push('/desk/artist/upload/video')}
            disabled={!artistData?.selectedArtist}
            title="Upload Video"
          >
            <VideoIcon className="h-4 w-4" />
            <span className="ml-1">Video</span>
          </Button>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ArtistManagementPage;
