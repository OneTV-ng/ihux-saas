"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, LogOut, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignOutPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await authClient.signOut();
        setIsSuccess(true);
        setIsSigningOut(false);
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (err: any) {
        setError(err.message || "Failed to sign out. Please try again.");
        setIsSigningOut(false);
      }
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {isSigningOut ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : isSuccess ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <LogOut className="h-6 w-6 text-destructive" />
            )}
          </div>
          <CardTitle>
            {isSigningOut
              ? "Signing Out..."
              : isSuccess
              ? "Signed Out Successfully"
              : "Sign Out Failed"}
          </CardTitle>
          <CardDescription>
            {isSigningOut
              ? "Please wait while we sign you out"
              : isSuccess
              ? "Redirecting you to the home page..."
              : error || "Something went wrong"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSigningOut && !isSuccess && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Try Again
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
