"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import IncrementalRegisterForm from "@/components/auth/incremental-register-form";
import { GoogleIcon, GithubIcon , SpotifyIcon} from "@/components/ui/icons";
import { signInWithGithub, signInWithSpotify ,signInWithGoogle } from "@/lib/auth-client";
import { GalleryVerticalEnd } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RegisterPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center w-full max-w-md gap-6">
        <a href="/" className="flex flex-col items-center gap-2 self-center font-medium">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary">
            <img src="/images/tenant/sflogo.png" alt="SingFLEX Logo" className="h-10 w-10 object-contain" />
          </div>
          <span className="font-bold text-lg text-primary">SingFLEX Global Distributions</span>
          <span className="text-xs text-muted-foreground text-center max-w-xs">Global simless Media distribution company focused on delivering high-quality content to audiences worldwide.</span>
        </a>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6">
            <IncrementalRegisterForm />
            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-muted-foreground/30" />
              <span className="mx-3 text-muted-foreground text-xs font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-muted-foreground/30" />
            </div>
            <div className="flex flex-row gap-2 w-full">
              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-center"
                type="button"
                onClick={signInWithGoogle}
              >
                <GoogleIcon className="mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-center"
                type="button"
                onClick={signInWithSpotify}
              >
                <SpotifyIcon className="mr-2" />
               Spotify
              </Button>

              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-center"
                type="button"
                onClick={signInWithGithub}
              >
                <GithubIcon className="mr-2" />
                GitHub
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link
                href="/auth/sign"
                className="text-primary underline hover:no-underline font-medium"
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
