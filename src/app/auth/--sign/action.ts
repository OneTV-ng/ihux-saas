"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { ActionResult } from "@/lib/schemas";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, or, like } from "drizzle-orm";

export async function loginUser({
  emailOrUsername,
  password,
  rememberMe,
  callback
}: {
  emailOrUsername: string;
  password: string;
  rememberMe?:boolean;
callback?: string;
}): Promise<ActionResult> {
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
        .select({ email: user.email })
        .from(user)
        .where(like(user.username, emailOrUsername))
        .limit(1);
      
      if (userRecord.length === 0) {
        return {
          error: { reason: "Invalid username or password" },
          success: null,
        };
      }
      
      email = userRecord[0].email;
    }
    
    // Authenticate with email
    await auth.api.signInEmail({ body: { email, password, rememberMe, callbackURL: callback || `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` } });

    return {
      success: { reason: "Login successful" },
      error: null,
      data: undefined,
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
