"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Music,
  Users,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  MapPin,
  Calendar,
  Edit,
  Save,
  Image as ImageIcon,
  Camera,
  Plus,
  Trash2,
  Facebook,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ArtistProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [artistData, setArtistData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/artist?selected=true");
        const json = await res.json();
        if (!json.data) {
          setError("No artist selected.");
          setIsLoading(false);
          router.push("/desk/artist");
          return;
        }
        setArtistData(json.data);
        setFormData({
          displayName: json.data.displayName || "",
          bio: json.data.bio || "",
          genre: json.data.genre || json.data.profile?.genre || "",
          subGenre: json.data.subGenre || json.data.profile?.subGenre || "",
          city: json.data.city || json.data.profile?.city || "",
          country: json.data.country || json.data.profile?.country || "",
          producer: json.data.producer || json.data.profile?.producer || "",
          songwriter: json.data.songwriter || json.data.profile?.songwriter || "",
          studio: json.data.studio || json.data.profile?.studio || "",
          recordLabel: json.data.recordLabel || json.data.profile?.recordLabel || "",
          language: json.data.language || json.data.profile?.language || "",
          picture: json.data.profile?.picture || "",
          coverImage: json.data.profile?.thumbnails?.cover || "",
          socialMedia: json.data.profile?.socialMedia || {},
          mediaPlatform: json.data.profile?.mediaPlatform || {},
          gallery: json.data.profile?.gallery || [],
        });
      } catch (e: any) {
        setError("Failed to load artist profile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [router]);

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    if (id.startsWith("social-")) {
      setFormData((prev: any) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [id.replace("social-", "")]: value },
      }));
    } else if (id.startsWith("platform-")) {
      setFormData((prev: any) => ({
        ...prev,
        mediaPlatform: { ...prev.mediaPlatform, [id.replace("platform-", "")]: value },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/artist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: artistData.id,
          displayName: formData.displayName,
          bio: formData.bio,
          genre: formData.genre,
          subGenre: formData.subGenre,
          city: formData.city,
          country: formData.country,
          producer: formData.producer,
          songwriter: formData.songwriter,
          studio: formData.studio,
          recordLabel: formData.recordLabel,
          language: formData.language,
          picture: formData.picture,
          thumbnails: {
            ...(artistData.profile?.thumbnails || {}),
            cover: formData.coverImage,
          },
          socialMedia: formData.socialMedia,
          mediaPlatform: formData.mediaPlatform,
          gallery: formData.gallery,
        }),
      });
      if (!res.ok) throw new Error("Failed to save artist profile.");
      const json = await res.json();
      setArtistData(json.data);
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || "Failed to save artist profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGalleryImage = (url: string) => {
    if (!url) return;
    setFormData((prev: any) => ({
      ...prev,
      gallery: [
        ...(prev.gallery || []),
        { url, title: "", description: "", order: (prev.gallery || []).length },
      ],
    }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_: any, i: number) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <MobileBottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <span className="text-lg text-red-500">{error}</span>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Artist Profile</h1>
            <p className="text-muted-foreground">Manage your public artist information</p>
          </div>
          <Button
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            variant={isEditing ? "default" : "outline"}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Cover Image & Avatar */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center relative overflow-hidden">
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <FileUpload
                    label=""
                    accept="image/*"
                    type="header"
                    maxSize={5}
                    value={formData.coverImage}
                    onUploadComplete={(url) => {
                      if (url) setFormData((prev: any) => ({ ...prev, coverImage: url }));
                    }}
                    className="w-auto"
                  />
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-background">
                  <AvatarImage src={formData.picture || artistData.profile?.picture} />
                  <AvatarFallback className="text-2xl">
                    {artistData.displayName?.substring(0, 2) || "AR"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer flex flex-col items-center text-white">
                      <Camera className="h-6 w-6" />
                      <span className="text-xs mt-1">Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("type", "profile");
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.url) {
                            setFormData((prev: any) => ({ ...prev, picture: data.url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{artistData.displayName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{artistData.genre || "-"}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[artistData.city, artistData.country].filter(Boolean).join(", ") || "-"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {artistData.createdAt ? new Date(artistData.createdAt).toLocaleDateString() : "-"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Songs", value: artistData.profile?.totalSongs || 0, icon: Music },
            { label: "Total Plays", value: artistData.profile?.totalPlays?.toLocaleString() || 0, icon: Music },
            { label: "Followers", value: artistData.profile?.totalFollowers?.toLocaleString() || 0, icon: Users },
          ].map((stat, index) => {
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

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
                <CardDescription>
                  Tell your fans about yourself and your music
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Artist Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        placeholder="Enter artist name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre</Label>
                      <Input
                        id="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        placeholder="e.g., Pop, Rock, Electronic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subGenre">Subgenre</Label>
                      <Input
                        id="subGenre"
                        value={formData.subGenre}
                        onChange={handleInputChange}
                        placeholder="e.g., Synthpop, Indie Rock"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g., Los Angeles"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g., United States"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="producer">Producer</Label>
                        <Input
                          id="producer"
                          value={formData.producer}
                          onChange={handleInputChange}
                          placeholder="e.g., John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="songwriter">Songwriter</Label>
                        <Input
                          id="songwriter"
                          value={formData.songwriter}
                          onChange={handleInputChange}
                          placeholder="e.g., Jane Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studio">Studio</Label>
                        <Input
                          id="studio"
                          value={formData.studio}
                          onChange={handleInputChange}
                          placeholder="e.g., Abbey Road Studios"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recordLabel">Record Label</Label>
                        <Input
                          id="recordLabel"
                          value={formData.recordLabel}
                          onChange={handleInputChange}
                          placeholder="e.g., Universal Music"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Tell your story..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">{artistData.bio || "No biography yet."}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Connect your social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
                  { id: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://x.com/username" },
                  { id: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/pagename" },
                  { id: "tiktok", label: "TikTok", icon: Music, placeholder: "https://tiktok.com/@username" },
                  { id: "website", label: "Website", icon: Globe, placeholder: "https://yourwebsite.com" },
                ].map((item) => (
                  <div className="space-y-2" key={item.id}>
                    <Label htmlFor={`social-${item.id}`} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Label>
                    <Input
                      id={`social-${item.id}`}
                      value={formData.socialMedia?.[item.id] || ""}
                      onChange={handleInputChange}
                      placeholder={item.placeholder}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Platforms Tab */}
          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Music Platforms</CardTitle>
                <CardDescription>
                  Link your music on streaming platforms so fans can find you everywhere
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
                  { id: "appleMusic", label: "Apple Music", placeholder: "https://music.apple.com/artist/..." },
                  { id: "youtube", label: "YouTube Music", placeholder: "https://music.youtube.com/channel/..." },
                  { id: "soundcloud", label: "SoundCloud", placeholder: "https://soundcloud.com/username" },
                  { id: "tidal", label: "Tidal", placeholder: "https://tidal.com/artist/..." },
                  { id: "deezer", label: "Deezer", placeholder: "https://www.deezer.com/artist/..." },
                  { id: "amazonMusic", label: "Amazon Music", placeholder: "https://music.amazon.com/artists/..." },
                ].map((item) => (
                  <div className="space-y-2" key={item.id}>
                    <Label htmlFor={`platform-${item.id}`} className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      {item.label}
                    </Label>
                    <Input
                      id={`platform-${item.id}`}
                      value={formData.mediaPlatform?.[item.id] || ""}
                      onChange={handleInputChange}
                      placeholder={item.placeholder}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>
                  Upload photos to showcase on your artist page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {(formData.gallery || []).map((item: any, index: number) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={item.url}
                        alt={item.title || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <div className="aspect-square">
                      <FileUpload
                        accept="image/*"
                        type="image"
                        maxSize={5}
                        onUploadComplete={(url) => handleAddGalleryImage(url)}
                        className="h-full"
                      />
                    </div>
                  )}
                </div>
                {!isEditing && (!formData.gallery || formData.gallery.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No gallery images yet. Click Edit Profile to add photos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage visibility and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to everyone
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      {artistData.profile?.isPublic ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Statistics</p>
                      <p className="text-sm text-muted-foreground">
                        Display play counts and follower numbers
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Verified Artist Badge</p>
                      <p className="text-sm text-muted-foreground">
                        Request verification for your artist profile
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      {artistData.profile?.isVerified ? "Verified" : "Request"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ArtistProfilePage;
