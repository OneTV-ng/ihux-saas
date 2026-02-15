"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, like } from "drizzle-orm";


export async function loginUser({
  emailOrUsername,
  password,rememberMe,
  callback
}: {
  emailOrUsername: string;
  password: string;
  rememberMe?:boolean;
  callback?: string;
}): Promise<ActionResult<{ user: { id: string; email: string } }>> {
  try {
    let email = emailOrUsername.trim();

    // Determine if input is email or username
    const isEmail = emailOrUsername.includes("@");

    if (isEmail) {
      // Input is email - use directly
      email = emailOrUsername.toLowerCase();
    } else {
      // Input is username - look up email by username
      const userRecord = await db
        .select({ email: users.email })
        .from(users)
        .where(like(users.username, emailOrUsername))
        .limit(1);

      if (userRecord.length === 0) {
        return {
          error: { reason: "Invalid username or password" },
          success: null,
        };
      }

      email = userRecord[0].email;
    }

    console.log("[LOGIN] Authenticating user with email:", email);

    // Use Better Auth's signInEmail which is configured to use bcrypt verification
    const { user: authUser } = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
        callbackURL: callback || `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    console.log("[LOGIN] Authentication successful for user:", authUser.id);

    return {
      success: { reason: "Login successful" },
      error: null,
      data: { user: { id: authUser.id, email: authUser.email } },
    };
  } catch (err) {
    console.error("[LOGIN] Error during login:", err);
    if (err instanceof APIError) {
      return {
        error: { reason: err.message },
        success: null,
      };
    }

    return { error: { reason: "Something went wrong." }, success: null };
  }
}
