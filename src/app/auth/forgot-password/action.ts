"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { createAndSendPin } from "@/lib/pin-service";

export async function forgotPassword(
  email: string,
  method: "link" | "pin" = "pin"
): Promise<ActionResult> {
  try {
    if (method === "pin") {
      await createAndSendPin({ email, type: "reset" });
      return {
        success: { reason: "Password reset PIN sent to your email. Check your inbox." },
        error: null,
      };
    }

    // For link method, use Better Auth's forgetPassword endpoint
    // which triggers the sendResetPassword callback configured in auth.ts
    const response = await fetch(`${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirectTo: "/auth/reset-password" }),
    });

    if (!response.ok) {
      throw new Error("Failed to send reset email");
    }

    return {
      success: { reason: "Password reset email sent. Please check your inbox." },
      error: null,
    };
  } catch (err) {
    if (err instanceof APIError) {
      return {
        error: { reason: err.message },
        success: null,
      };
    }

    return { error: { reason: "Something went wrong." }, success: null };
  }
}
