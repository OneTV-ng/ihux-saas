"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { verifyPin } from "@/lib/pin-service";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function resetPassword({
  token,
  password,
  email,
  pin,
}: {
  token?: string;
  password: string;
  email?: string;
  pin?: string;
}): Promise<ActionResult> {
  try {
    // PIN-based reset
    if (pin && email) {
      const pinResult = await verifyPin({ email, pin, type: "reset" });
      
      if (!pinResult.valid) {
        return {
          error: { reason: pinResult.error || "Invalid PIN" },
          success: null,
        };
      }

      // Find user by email
      const users = await db.select().from(user).where(eq(user.email, email));
      if (users.length === 0) {
        return {
          error: { reason: "User not found" },
          success: null,
        };
      }

      // Update password using Better Auth's hashing
      const salt = randomBytes(16).toString('hex');
      const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
      const hashedPassword = `${salt}:${derivedKey.toString('hex')}`;
      
      await db
        .update(account)
        .set({ password: hashedPassword })
        .where(eq(account.userId, users[0].id));

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
