"use client";

import { z } from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useId, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../../app/auth/--sign/action";
import { FormSuccess, FormError } from "../ui/form-messages";
import { useAuth } from "@/contexts/auth-context";

const schema = z.object({
  emailOrUsername: z.string().min(1, { message: "Email or username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { emailOrUsername: "", password: "", rememberMe: false },
  });

  const [isVisible, setIsVisible] = useState(false);
  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const id = useId();
  const router = useRouter();
  const { forceRefresh } = useAuth();
  const emailOrUsername = watch("emailOrUsername");

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  // Check if email is verified when user types email
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!emailOrUsername || emailOrUsername.length < 3) {
        setShowResendVerification(false);
        return;
      }

      // Only check if it looks like an email
      if (!emailOrUsername.includes("@")) {
        setShowResendVerification(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const res = await fetch(`/api/dxl/v3?@=auth.check.email.verified&email=${encodeURIComponent(emailOrUsername)}`);
        const data = await res.json();
        
        if (data.status && data.data?.exists && !data.data?.verified) {
          setShowResendVerification(true);
        } else {
          setShowResendVerification(false);
        }
      } catch (error) {
        setShowResendVerification(false);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmailVerification, 800);
    return () => clearTimeout(timer);
  }, [emailOrUsername]);

  const onSubmit = async (data: FormData) => {
    setFormState({});
    const result = await loginUser({
      ...data,
    });
    if (result.success) {
      setFormState({ success: result.success.reason });
      // Refresh auth context to update navbar immediately
      await forceRefresh();
      router.push("/dashboard");
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
      <FormError message={formState.error || ""} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="emailOrUsername">Email or Username</Label>
        <Input
          id="emailOrUsername"
          type="text"
          placeholder="you@example.com or username"
          autoComplete="username"
          {...register("emailOrUsername")}
        />
        {errors.emailOrUsername && (
          <span className="text-xs text-red-500">{errors.emailOrUsername.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>Password</Label>
        <div className="relative">
          <Input
            id={id}
            type={isVisible ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="pe-9"
            {...register("password")}
          />
          <button
            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            aria-controls="password"
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
        <div className="flex flex-col gap-1 text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:underline text-right"
          >
            Forgot password?
          </Link>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="mr-2"
            />
            <Label htmlFor="rememberMe" className="cursor-pointer">Remember me (stay signed in for 90 days)</Label>
          </div>
          {showResendVerification && (
            <Link
              href={`/auth/resend-verification?email=${encodeURIComponent(emailOrUsername)}`}
              className="text-orange-500 hover:underline text-right"
            >
              Email not verified? Resend verification
            </Link>
          )}
        </div>
      </div>
      <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;