"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSlugValidation } from "@/hooks/use-slug-validation";
import { useShowMessage } from "@/hooks/use-show-message";
import { SlugValidationFeedback } from "./slug-validation-feedback";
import { AlertCircle } from "lucide-react";

interface CreateArtistFormProps {
  onSuccess?: (artistId: string) => void;
  onCancel?: () => void;
}

export function CreateArtistForm({ onSuccess, onCancel }: CreateArtistFormProps) {
  const router = useRouter();
  const { success, error: showError } = useShowMessage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    artistName: "",
    displayName: "",
    genre: "",
    city: "",
    country: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { loading: slugLoading, error: slugError, result: slugResult, checkSlug } = useSlugValidation();

  const handleArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      artistName: value,
    }));

    // Trigger background slug check
    if (value.trim().length > 0) {
      checkSlug(value);
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      displayName: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate slug availability
    if (!slugResult?.available) {
      const errorMsg = "Please choose an available artist name";
      setSubmitError(errorMsg);
      showError(errorMsg);
      return;
    }

    // Validate required fields
    if (!formData.artistName.trim() || !formData.displayName.trim()) {
      const errorMsg = "Artist name and display name are required";
      setSubmitError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/artist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create artist");
      }

      const { artistId } = await response.json();

      // Show success message
      success(
        `Artist "${formData.displayName}" created successfully!`,
        "You can now start uploading songs"
      );

      if (onSuccess) {
        onSuccess(artistId);
      } else {
        router.push(`/desk/artist/${artistId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create artist";
      setSubmitError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.artistName.trim() && formData.displayName.trim() && slugResult?.available;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Artist</CardTitle>
        <CardDescription>
          Set up a new artist profile with real-time name availability checking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{submitError}</p>
            </div>
          )}

          {/* Artist Name with Real-time Validation */}
          <div className="space-y-2">
            <Label htmlFor="artistName" className="font-semibold">
              Artist Name *
            </Label>
            <Input
              id="artistName"
              placeholder="e.g., The Black Mambas"
              value={formData.artistName}
              onChange={handleArtistNameChange}
              disabled={loading}
              className="border-zinc-200 dark:border-zinc-700"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              This will be used for your public artist URL
            </p>
            <SlugValidationFeedback
              loading={slugLoading}
              error={slugError}
              result={slugResult}
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="font-semibold">
              Display Name *
            </Label>
            <Input
              id="displayName"
              placeholder="e.g., The Black Mambas (Official)"
              value={formData.displayName}
              onChange={handleDisplayNameChange}
              disabled={loading}
              className="border-zinc-200 dark:border-zinc-700"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              How your artist name appears on songs and profiles
            </p>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                placeholder="e.g., Hip-Hop"
                value={formData.genre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, genre: e.target.value }))
                }
                disabled={loading}
                className="border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., New York"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                disabled={loading}
                className="border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., United States"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
                disabled={loading}
                className="border-zinc-200 dark:border-zinc-700"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid || loading || slugLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Creating..." : "Create Artist"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
