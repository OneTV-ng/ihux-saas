"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/app/auth/forgot-password/action";
import { FormSuccess, FormError } from "../ui/form-messages";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});

  const onSubmit = async (data: FormData) => {
    setFormState({});
    const result = await forgotPassword(data.email, "pin");
    if (result.success) {
      setFormState({ success: result.success.reason });
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
        {isSubmitting ? "Sending..." : "Send Reset PIN"}
      </Button>
      <Button
        type="button"
        className="w-full"
        variant="outline"
        onClick={() => {
          const email = (document.getElementById('email') as HTMLInputElement)?.value;
          if (email) router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }}
      >
        Enter PIN
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        You'll receive a 6-digit PIN code via email
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
