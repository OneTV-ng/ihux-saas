import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ title = "Loading", description = "Please wait..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Spinner size="lg" className="mx-auto text-green-500" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  message?: string;
}

export function LoadingCard({ title = "Loading", message = "Processing your request..." }: LoadingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Spinner size="md" />
      <div className="text-center">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
