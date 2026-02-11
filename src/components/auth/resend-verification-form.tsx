"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { resendVerificationEmail, verifyEmailWithCode } from "@/app/auth/resend-verification/action";
import { FormSuccess, FormError } from "../ui/form-messages";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const verificationSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
});

type FormData = z.infer<typeof schema>;
type VerificationData = z.infer<typeof verificationSchema>;

const ResendVerificationForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const {
    register: registerVerification,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors, isSubmitting: isVerifying },
    reset: resetVerification,
  } = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
  });

  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [verificationState, setVerificationState] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [isVerified, setIsVerified] = useState(false);

  // Set email from URL parameter if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: FormData) => {
    setFormState({});
    const result = await resendVerificationEmail(data.email, "pin");
    if (result.success) {
      setFormState({ success: result.success.reason });
      setCurrentEmail(data.email);
      setVerificationModalOpen(true);
      setIsVerified(false);
      setVerificationState({});
      resetVerification();
    } else if (result.error) {
      setFormState({ error: result.error.reason });
    }
  };

  const onVerificationSubmit = async (data: VerificationData) => {
    setVerificationState({});
    const result = await verifyEmailWithCode(currentEmail, data.code);
    
    if (result.success) {
      setVerificationState({ success: result.success.reason });
      setIsVerified(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/sign?verified=true");
      }, 2000);
    } else if (result.error) {
      setVerificationState({ error: result.error.reason });
    }
  };

  const handleModalClose = () => {
    if (!isVerified) {
      setVerificationModalOpen(false);
      setVerificationState({});
      resetVerification();
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-5"
      >
        <FormSuccess message={formState.success || ""} />
        <FormError message={formState.error || ""} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>
        <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Resend Verification PIN"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          You'll receive a 6-digit PIN code via email
        </p>
      </form>

      {/* Verification Modal */}
      <Dialog open={verificationModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Email Verified!
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 text-primary" />
                  Enter Verification Code
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isVerified
                ? "Your email has been successfully verified. Redirecting to login..."
                : `A 6-digit verification code has been sent to ${currentEmail}`}
            </DialogDescription>
          </DialogHeader>

          {!isVerified ? (
            <form onSubmit={handleVerificationSubmit(onVerificationSubmit)} className="space-y-4">
              <FormSuccess message={verificationState.success || ""} />
              <FormError message={verificationState.error || ""} />
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoComplete="off"
                  autoFocus
                  {...registerVerification("code", {
                    onChange: (e) => {
                      // Only allow numbers
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    },
                  })}
                />
                {verificationErrors.code && (
                  <span className="text-xs text-red-500">
                    {verificationErrors.code.message}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleModalClose}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    handleModalClose();
                    await onSubmit({ email: currentEmail });
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-muted-foreground">
                Redirecting you to login page...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResendVerificationForm;
