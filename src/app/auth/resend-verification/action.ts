"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { createAndSendPin, verifyPin } from "@/lib/pin-service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function resendVerificationEmail(
  email: string,
  method: "link" | "pin" = "pin"
): Promise<ActionResult> {
  try {
    if (method === "pin") {
      await createAndSendPin({ email, type: "verification" });
      return {
        success: { reason: "Verification PIN sent to your email. Check your inbox." },
        error: null,
      };
    }

    await auth.api.sendVerificationEmail({
      body: { email },
    });

    return {
      success: { reason: "Verification email sent. Please check your inbox." },
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

export async function verifyEmailWithCode(
  email: string,
  code: string
): Promise<ActionResult> {
  try {
    // Verify the PIN code
    const result = await verifyPin({ email, pin: code, type: "verification" });

    if (!result.valid) {
      return {
        error: { reason: result.error || "Invalid or expired verification code" },
        success: null,
      };
    }

    // Mark email as verified in database
    await db
      .update(users)
      .set({ 
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));

    return {
      success: { reason: "Email verified successfully!" },
      error: null,
    };
  } catch (err) {
    console.error("Email verification error:", err);
    return {
      error: { reason: "Failed to verify email. Please try again." },
      success: null,
    };
  }
}
