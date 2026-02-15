"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/app/auth/reset-password/action";
import { FormSuccess, FormError } from "../ui/form-messages";
import { PinInput } from "../ui/pin-input";
import { getDxlApiClient } from "@/lib/dxl-api-client";

const schema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    pin: z.string().length(6, { message: "PIN must be 6 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const ResetPasswordWithPinForm = () => {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const pinParam = searchParams.get("pin") || "";
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isRequestingNewPin, setIsRequestingNewPin] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailParam, pin: pinParam, password: "", confirmPassword: "" },
  });

  // Watch form values and log them in real-time
  const formValues = watch();
  useEffect(() => {
    console.log("[FORM] Current form values:", {
      email: formValues.email,
      pin: formValues.pin,
      password: formValues.password ? `***${formValues.password.length} chars` : undefined,
      confirmPassword: formValues.confirmPassword ? `***${formValues.confirmPassword.length} chars` : undefined,
    });
  }, [formValues]);

  // Log any validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("[FORM] Validation errors:", errors);
    }
  }, [errors]);

  // Auto-verify PIN if both email and pin are present in query
  useEffect(() => {
    if (emailParam && pinParam && !pinVerified) {
      (async () => {
        setValue("pin", pinParam);
        setPinError("");
        try {
          const client = getDxlApiClient();
          const data = await client.verifyPin(emailParam, pinParam);
          if (data.status) setPinVerified(true);
          else setPinError(data.message || "Invalid PIN");
        } catch (error) {
          setPinError("Failed to verify PIN");
        }
      })();
    }
  }, [emailParam, pinParam, pinVerified, setValue]);

  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});
  const id = useId();
  const confirmId = useId();
  const router = useRouter();

  const toggleVisibility = () => setIsVisible((prev) => !prev);
  const toggleConfirmVisibility = () => setIsConfirmVisible((prev) => !prev);

  // Request new PIN
  const handleRequestNewPin = async () => {
    setIsRequestingNewPin(true);
    setPinError("");
    try {
      const client = getDxlApiClient();
      const data = await client.resendResetPin(getValues("email"));
      if (data.status) {
        setPinError("New PIN sent to your email! Check your inbox.");
        // Clear the PIN input for retry
        setValue("pin", "");
      } else {
        setPinError(data.message || "Failed to send new PIN");
      }
    } catch (error) {
      setPinError("Failed to request new PIN");
    } finally {
      setIsRequestingNewPin(false);
    }
  };


  const onSubmit = async (data: FormData) => {
    setFormState({});

    // DEBUG: Log all form data
    console.log("[FORM] Raw form data:", {
      email: data.email,
      pin: data.pin,
      password: data.password,
      confirmPassword: data.confirmPassword,
      allKeys: Object.keys(data),
      allValues: data,
    });

    // Validate all required fields
    if (!data.email || !data.email.trim()) {
      console.error("[FORM] Email is missing or empty");
      setFormState({ error: "Email is required" });
      return;
    }

    if (!data.pin || data.pin.length !== 6) {
      console.error("[FORM] PIN is invalid:", { pin: data.pin, length: data.pin?.length });
      setFormState({ error: "Valid 6-digit PIN is required" });
      return;
    }

    if (!data.password || data.password.length < 8) {
      console.error("[FORM] Password is invalid:", { password: data.password, length: data.password?.length });
      setFormState({ error: "Password must be at least 8 characters" });
      return;
    }

    if (!data.confirmPassword || data.password !== data.confirmPassword) {
      console.error("[FORM] Password mismatch:", { password: data.password?.length, confirm: data.confirmPassword?.length });
      setFormState({ error: "Passwords do not match" });
      return;
    }

    console.log("[FORM] ✅ All validations passed, submitting with:", {
      email: data.email,
      pin: data.pin.length,
      password: data.password.length,
    });

    const result = await resetPassword({
      email: data.email,
      pin: data.pin,
      password: data.password,
    });
    if (result.success) {
      setFormState({ success: result.success.reason });
      setTimeout(() => {
        // Redirect to signin with email pre-filled
        router.push(`/auth/signin?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } else if (result.error) {
      setFormState({ error: result.error.reason });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      <FormSuccess message={formState.success || ""} />
      <FormError message={formState.error || (pinError && !pinError.includes("sent") ? pinError : "")} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          value={emailParam}
          readOnly={!!emailParam}
        />
      </div>
      {/* PIN section is only visible if not verified */}
      {!pinVerified && (
        <div className="flex flex-col gap-4 transition-all duration-500 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-md p-6 border border-primary/10 animate-in fade-in-0 zoom-in-95">
          <h3 className="text-lg font-semibold text-primary mb-1 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Verify PIN
          </h3>
          <p className="text-sm text-muted-foreground mb-2">Enter the 6-digit code sent to your email to continue.</p>
          <PinInput
            length={6}
            onComplete={async (pin) => {
              setValue("pin", pin);
              setPinError("");
              setIsVerifyingPin(true);

              // Verify pin with loading state
              try {
                const client = getDxlApiClient();
                const data = await client.verifyPin(getValues("email"), pin);

                // Small delay for better UX (show success feedback)
                setTimeout(() => {
                  if (data.status) {
                    setPinVerified(true);
                    setIsVerifyingPin(false);
                  } else {
                    setPinError(data.message || "Invalid PIN");
                    setIsVerifyingPin(false);
                  }
                }, 600);
              } catch (error) {
                setPinError("Failed to verify PIN");
                setIsVerifyingPin(false);
              }
            }}
            disabled={isSubmitting || isVerifyingPin}
            className="mb-1"
          />

          {/* Verification Loading State */}
          {isVerifyingPin && (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <span className="text-sm font-medium text-muted-foreground">Verifying PIN...</span>
            </div>
          )}

          {/* Error Messages and Actions */}
          {errors.pin && (
            <span className="text-xs text-red-500">{errors.pin.message}</span>
          )}
          {pinError && !errors.pin && (
            <div className="flex flex-col gap-3">
              <span className={`text-xs ${pinError.includes("sent") ? "text-green-600" : "text-red-500"}`}>
                {pinError}
              </span>
              {!pinError.includes("sent") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRequestNewPin}
                  disabled={isRequestingNewPin}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isRequestingNewPin ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Request New PIN
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {pinVerified && (
        <div className="flex flex-col gap-4 transition-all duration-500 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-md p-6 border border-green-500/20 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-primary tracking-tight">
              Set New Password
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Create a strong password for your account.</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor={id}>New Password</Label>
            <div className="relative">
              <Input
                id={id}
                type={isVisible ? "text" : "password"}
                placeholder="New password"
                autoComplete="new-password"
                className="pe-9"
                {...register("password")}
              />
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
              >
                {isVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={confirmId}>Confirm Password</Label>
            <div className="relative">
              <Input
                id={confirmId}
                type={isConfirmVisible ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="pe-9"
                {...register("confirmPassword")}
              />
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={toggleConfirmVisibility}
                aria-label={isConfirmVisible ? "Hide password" : "Show password"}
                aria-pressed={isConfirmVisible}
              >
                {isConfirmVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
            )}
          </div>
        </div>
      )}
      <Button type="submit" className="mt-4" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordWithPinForm;
