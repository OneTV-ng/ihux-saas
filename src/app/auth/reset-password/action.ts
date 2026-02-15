"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { verifyPin } from "@/lib/pin-service";
import { db } from "@/db";
import { account, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function resetPassword({
  token,
  password,
  email,
  pin,
  verifyPin: shouldVerifyPin = false,
}: {
  token?: string;
  password: string;
  email?: string;
  pin?: string;
  verifyPin?: boolean; // Set to true to re-verify PIN (backwards compatibility with older code)
}): Promise<ActionResult> {
  try {
    console.log("[RESET PASSWORD] Input params:", { email, pin: !!pin, password: !!password, token: !!token, verifyPin: shouldVerifyPin });

    // Validate PIN-based reset inputs
    if (!pin || !email) {
      console.log("[RESET PASSWORD] Missing PIN or email:", { hasPin: !!pin, hasEmail: !!email });
      return {
        error: { reason: "Email and PIN are required" },
        success: null,
      };
    }

    if (!password || password.length < 8) {
      console.log("[RESET PASSWORD] Invalid password length");
      return {
        error: { reason: "Password must be at least 8 characters" },
        success: null,
      };
    }

    // PIN-based reset
    if (pin && email) {
      const normalizedEmail = email.toLowerCase();
      console.log("[RESET PASSWORD] PIN-based reset with email:", normalizedEmail, { verifyPin: shouldVerifyPin });

      // Optionally verify PIN again (for backwards compatibility)
      if (shouldVerifyPin) {
        console.log("[RESET PASSWORD] Verifying PIN...");
        const pinResult = await verifyPin({ email: normalizedEmail, pin, type: "reset" });
        console.log("[RESET PASSWORD] PIN verification result:", { valid: pinResult.valid, error: pinResult.error });

        if (!pinResult.valid) {
          return {
            error: { reason: pinResult.error || "Invalid PIN" },
            success: null,
          };
        }
      } else {
        console.log("[RESET PASSWORD] Skipping PIN verification (already verified on frontend)");
      }

      // Find user by email
      console.log("[RESET PASSWORD] Finding user with email:", normalizedEmail);
      const foundUsers = await db.select().from(users).where(eq(users.email, normalizedEmail));
      console.log("[RESET PASSWORD] Users found:", foundUsers.length);

      if (foundUsers.length === 0) {
        return {
          error: { reason: "User not found" },
          success: null,
        };
      }

      // Update password in account table (Better Auth stores email/password here)
      console.log("[RESET PASSWORD] Updating password for user:", foundUsers[0].id);

      // Get the email account for this user
      const emailAccount = await db
        .select()
        .from(account)
        .where(eq(account.userId, foundUsers[0].id))
        .limit(1);

      if (emailAccount.length > 0) {
        // Update existing account with new password
        console.log("[RESET PASSWORD] Updating existing email account");
        await db
          .update(account)
          .set({ password })
          .where(eq(account.userId, foundUsers[0].id));

        console.log("[RESET PASSWORD] Password updated successfully");
      } else {
        // Create email account if it doesn't exist
        console.log("[RESET PASSWORD] Creating email account for user");
        const { randomUUID } = await import("crypto");
        await db.insert(account).values({
          id: randomUUID(),
          accountId: `email-${foundUsers[0].id}`,
          providerId: "credential",
          userId: foundUsers[0].id,
          password,
        });

        console.log("[RESET PASSWORD] Email account created with password");
      }

      return {
        success: { reason: "Password reset successful. You can now log in with your new password." },
        error: null,
      };
    }

    // Token-based reset
    if (token) {
      await auth.api.resetPassword({
        body: { newPassword: password },
        query: { token },
      });

      return {
        success: { reason: "Password reset successful. You can now log in with your new password." },
        error: null,
      };
    }

    return {
      error: { reason: "Invalid reset method" },
      success: null,
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
