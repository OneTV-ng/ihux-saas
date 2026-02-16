"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Loader,
  Music,
} from "lucide-react";
import { mobileApi } from "@/lib/mobile-api-client";

export default function AdminUploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    type: "single",
    artistId: "",
    artistName: "",
    genre: "",
    language: "en",
    upc: "",
    cover: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.artistId.trim()) {
        throw new Error("Artist ID is required");
      }
      if (!formData.artistName.trim()) {
        throw new Error("Artist name is required");
      }

      // Call API to create song
      const response = await mobileApi.admin.uploadSong({
        ...formData,
        cover: formData.cover || undefined,
        upc: formData.upc || undefined,
        copyrightAcknowledged: true,
      });

      if (response.success) {
        const songId = (response.data as any)?.songId || (response.data as any)?.id;
        setSuccessId(songId);
        setSuccess(true);

        // Reset form
        setFormData({
          title: "",
          type: "single",
          artistId: "",
          artistName: "",
          genre: "",
          language: "en",
          upc: "",
          cover: "",
        });

        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.error || "Failed to upload song");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload song");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/songs">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Upload className="w-8 h-8 text-primary" />
            Upload Song
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new song to the platform
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">
                Song created successfully!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Song ID: {successId}
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/admin/songs">
                  <Button variant="outline" size="sm">
                    Back to Songs
                  </Button>
                </Link>
                <Button
                  onClick={() => setSuccess(false)}
                  variant="ghost"
                  size="sm"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Song Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Song Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter song title"
                required
              />
            </div>

            {/* Artist ID and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Artist ID *
                </label>
                <Input
                  type="text"
                  name="artistId"
                  value={formData.artistId}
                  onChange={handleChange}
                  placeholder="e.g., artist_123abc"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Artist Name *
                </label>
                <Input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
            </div>

            {/* Type and Genre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="single">Single</option>
                  <option value="album">Album</option>
                  <option value="medley">Medley</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <Input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="e.g., Pop, Hip-Hop"
                />
              </div>
            </div>

            {/* Language and UPC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  UPC (Optional)
                </label>
                <Input
                  type="text"
                  name="upc"
                  value={formData.upc}
                  onChange={handleChange}
                  placeholder="Universal Product Code"
                />
              </div>
            </div>

            {/* Cover URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Image URL (Optional)
              </label>
              <Input
                type="url"
                name="cover"
                value={formData.cover}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 flex-1 md:flex-none"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    Create Song
                  </>
                )}
              </Button>
              <Link href="/admin/songs">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> After creating a song, you'll need to upload
            tracks (audio files) to the song. Each song can have multiple tracks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
