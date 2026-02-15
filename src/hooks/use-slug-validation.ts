"use client";

import { useState, useCallback, useRef } from "react";

interface SlugValidationResult {
  available: boolean;
  message: string;
  suggestedSlug?: string;
}

export function useSlugValidation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SlugValidationResult | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const checkSlug = useCallback(
    async (artistName: string, debounceMs = 500) => {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (!artistName || artistName.trim().length === 0) {
        setResult(null);
        setError(null);
        return;
      }

      // Set debounce timer
      debounceTimer.current = setTimeout(async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/artist/check-slug?name=${encodeURIComponent(artistName)}`
          );

          if (!response.ok) {
            throw new Error("Failed to check slug availability");
          }

          const data = await response.json();
          setResult(data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to check slug availability"
          );
          setResult(null);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    []
  );

  return {
    loading,
    error,
    result,
    checkSlug,
  };
}
