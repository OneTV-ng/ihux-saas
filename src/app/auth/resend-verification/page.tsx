"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import ResendVerificationForm from "@/components/auth/resend-verification-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Suspense } from "react";

function ResendVerificationContent() {
  return (
    <>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center w-full max-w-md gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          DXL Music HUB
        </a>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">Resend Verification Email</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Enter your email address and we'll send you a new verification link.
              </p>
            </div>
            <ResendVerificationForm />
            <div className="text-center text-sm mt-4">
              Already verified?{" "}
              <Link
                href="/auth/sign"
                className="text-primary underline hover:no-underline font-medium"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

const ResendVerificationPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <ResendVerificationContent />
      </Suspense>
    </div>
  );
};

export default ResendVerificationPage;
