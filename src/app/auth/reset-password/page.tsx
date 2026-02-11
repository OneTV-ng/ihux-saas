"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GalleryVerticalEnd } from "lucide-react";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import ResetPasswordWithPinForm from "@/components/auth/reset-password-with-pin-form";
import { ThemeToggle } from "@/components/theme-toggle";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const usePin = !token;

  if (token) {
    // Token-based reset
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
                <h2 className="text-2xl font-bold">Reset Password</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Enter your new password below.
                </p>
              </div>
              <ResetPasswordForm token={token} />
              <div className="text-center text-sm mt-4">
                Remember your password?{" "}
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
      </div>
    );
  }

  // PIN-based reset
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
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
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Enter the PIN code sent to your email and your new password.
              </p>
            </div>
            <ResetPasswordWithPinForm />
            <div className="text-center text-sm mt-4">
              Remember your password?{" "}
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
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
