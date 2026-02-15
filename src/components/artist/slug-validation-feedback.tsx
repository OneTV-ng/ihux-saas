"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useShowMessage } from "@/hooks/use-show-message";

interface SlugValidationFeedbackProps {
  loading?: boolean;
  error?: string | null;
  result?: {
    available: boolean;
    message: string;
    suggestedSlug?: string;
  } | null;
  showNotifications?: boolean;
}

export function SlugValidationFeedback({
  loading = false,
  error = null,
  result = null,
  showNotifications = false,
}: SlugValidationFeedbackProps) {
  const { success, info, error: showError } = useShowMessage();

  // Show notifications when validation completes
  useEffect(() => {
    if (!showNotifications) return;

    if (result?.available) {
      success("Artist name is available!", "You can use this name for your artist profile");
    } else if (result && !result.available) {
      showError(
        "Artist name is taken",
        result.suggestedSlug ? `Try "${result.suggestedSlug}" instead` : undefined
      );
    }
  }, [result, showNotifications, success, showError]);

  // Show error notification
  useEffect(() => {
    if (!showNotifications || !error) return;
    showError("Validation error", error);
  }, [error, showNotifications, showError]);

  if (!loading && !error && !result) {
    return null;
  }

  if (loading) {
    return (
      <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20">
        <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Checking artist name availability...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (result) {
    return (
      <Alert
        className={
          result.available
            ? "border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20"
            : "border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20"
        }
      >
        {result.available ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
        <AlertDescription
          className={
            result.available
              ? "text-green-800 dark:text-green-200"
              : "text-amber-800 dark:text-amber-200"
          }
        >
          {result.message}
          {result.suggestedSlug && (
            <p className="text-sm mt-1">
              Try <span className="font-semibold">{result.suggestedSlug}</span> instead
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
