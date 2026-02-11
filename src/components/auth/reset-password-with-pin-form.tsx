"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/app/auth/reset-password/action";
import { FormSuccess, FormError } from "../ui/form-messages";
import { PinInput } from "../ui/pin-input";

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

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
const ResetPasswordWithPinForm = () => {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const pinParam = searchParams.get("pin") || "";
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailParam, pin: pinParam, password: "", confirmPassword: "" },
  });

  // Auto-verify PIN if both email and pin are present in query
  useEffect(() => {
    if (emailParam && pinParam && !pinVerified) {
      (async () => {
        setValue("pin", pinParam);
        setPinError("");
        const res = await fetch("/api/artist/verify-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailParam, pin: pinParam }),
        });
        const data = await res.json();
        if (data.success) setPinVerified(true);
        else setPinError(data.error || "Invalid PIN");
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

  const onSubmit = async (data: FormData) => {
    setFormState({});
    const result = await resetPassword({
      email: data.email,
      pin: data.pin,
      password: data.password,
    });
    if (result.success) {
      setFormState({ success: result.success.reason });
      setTimeout(() => {
        router.push("/auth/sign");
      }, 2000);
    } else if (result.error) {
      setFormState({ error: result.error.reason });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <FormSuccess message={formState.success || ""} />
      <FormError message={formState.error || pinError || ""} />
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
      {!pinVerified && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Enter PIN Code</Label>
            <PinInput
              length={6}
              onComplete={async (pin) => {
                setValue("pin", pin);
                setPinError("");
                // Try to verify pin only
                const res = await fetch("/api/artist/verify-pin", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: getValues("email"), pin }),
                });
                const data = await res.json();
                if (data.success) setPinVerified(true);
                else setPinError(data.error || "Invalid PIN");
              }}
              disabled={isSubmitting}
            />
            {errors.pin && (
              <span className="text-xs text-red-500">{errors.pin.message}</span>
            )}
          </div>
        </>
      )}
      {pinVerified && (
        <>
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
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
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
              <span className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </>
      )}
    </form>
  );
};

export default ResetPasswordWithPinForm;
