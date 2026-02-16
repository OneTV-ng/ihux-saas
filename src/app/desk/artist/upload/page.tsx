"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Music, Layers, Disc3, Video, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import Link from "next/link";

/*
  SINGFLEX – UPLOAD TYPE SELECTOR PAGE
  Route: /artist/upload
  Requires: Verified user + Selected artist
*/

export default function UploadSelector() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [userVerificationStatus, setUserVerificationStatus] = useState<string>("updating");

  // Check user verification and selected artist
  useEffect(() => {
    const checkRequirements = async () => {
      try {
        setIsLoading(true);

        // Check user profile verification status
        const profileResponse = await fetch("/api/profile");
        const profileData = await profileResponse.json();

        if (profileData.success) {
          const verStatus = profileData.data.verificationStatus || "updating";
          setUserVerificationStatus(verStatus);
          setIsVerified(verStatus === "verified");
        }

        // Check for selected artist
        const artistResponse = await fetch("/api/artist?selected=true");
        const artistData = await artistResponse.json();

        if (artistData.success && artistData.data) {
          setSelectedArtist(artistData.data);
        }
      } catch (error) {
        console.error("Error checking requirements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRequirements();
  }, []);

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

  // If not verified, show verification required message
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageBreadcrumb />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
                  <p className="text-muted-foreground mb-4">
                    You must be a verified user to upload music. Please complete your profile verification first.
                  </p>
                  <Badge variant="outline" className="mb-4">
                    Current Status: {userVerificationStatus === "submitted" ? "Under Review" : "Not Verified"}
                  </Badge>
                </div>
                <Button onClick={() => router.push("/desk/profile#verification")}>
                  Go to Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // If no artist selected, redirect to artist management
  if (!selectedArtist) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageBreadcrumb />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Select an Artist</h2>
                  <p className="text-muted-foreground mb-4">
                    You need to select an artist profile before uploading music. Create or select an artist to continue.
                  </p>
                </div>
                <Button onClick={() => router.push("/desk/artist")}>
                  Manage Artists
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    );
  }
  const options = [
    {
      title: "Music Single",
      description: "Upload and distribute one song",
      icon: Music,
      type: "single",
      link: "/desk/artist/upload/now?type=single"
    },
    {
      title: "Music Medley",
      description: "Multiple songs merged into one release (2-4 tracks)",
      icon: Layers,
      type: "medley",
      link: "/desk/artist/upload/now?type=medley"
    },
    {
      title: "Multi-Track Album / EP",
      description: "Upload multiple tracks as an album (5+ tracks)",
      icon: Disc3,
      type: "album",
      link: "/desk/artist/upload/now?type=album"
    },
    {
      title: "Music Video",
      description: "Upload and distribute your music video",
      icon: Video,
      link: "/desk/artist/upload/video"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-[0px]">
       <Navbar />
       <PageBreadcrumb />
      {/* HEADER */}
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">What do you want to upload?</h1>
        <p className="text-muted-foreground mt-3">Choose a release type to get started</p>
      </header>

      {/* Selected Artist Info */}
      {selectedArtist && (
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium">Uploading as:</p>
                    <p className="text-lg font-bold">{selectedArtist.displayName}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/desk/artist")}
                >
                  Change Artist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SELECTOR CARDS */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((item, i) => (
          <Link href={item.link} key={i} passHref legacyBehavior>
            <a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-card border border-border rounded-2xl p-8 hover:border-primary transition"
              >
                <Card className="bg-transparent border-none shadow-none">
                  <CardContent className="p-0 flex items-center gap-5">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="text-primary" size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </a>
          </Link>
        ))}
      </section>
            <MobileBottomNav />
    </div>
  );
}

