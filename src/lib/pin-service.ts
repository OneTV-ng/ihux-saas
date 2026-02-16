"use server";

import { db } from "@/db";
import { verification, users } from "@/db/schema";
import { eq, and, gt, lt } from "drizzle-orm";
import { generatePin, sendPinEmail } from "./email";

/**
 * Create and send a PIN to the specified email
 */
export async function createAndSendPin({
  email,
  type,
}: {
  email: string;
  type: "verification" | "reset";
}) {
  const pin = generatePin();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store PIN in database
  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: email,
    value: pin,
    expiresAt: expiresAt,
    type: `pin-${type}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Log PIN for testing
  console.log(`[PIN] ${type.toUpperCase()} code for ${email}: ${pin}`);

  // Send PIN via email
  await sendPinEmail({ to: email, pin, type });

  return true;
}

/**
 * Verify PIN using email address
 */
export async function verifyPin({
  email,
  pin,
  type,
}: {
  email: string;
  pin: string;
  type: "verification" | "reset";
}): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const result = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email),
          eq(verification.value, pin),
          eq(verification.type, `pin-${type}`),
          gt(verification.expiresAt, new Date())
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { valid: false, error: "Invalid or expired PIN" };
    }

    // Get user ID if it's a verification type
    let userId: string | undefined;
    if (type === "verification") {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length > 0) {
        userId = user[0].id;

        // Mark email as verified
        if (userId) {
          await db
            .update(users)
            .set({
              emailVerified: true,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
        }
      }
    }

    // Delete used PIN
    await db
      .delete(verification)
      .where(eq(verification.id, result[0].id));

    return { valid: true, userId };
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return { valid: false, error: "Verification failed" };
  }
}

/**
 * Verify PIN using user ID
 */
export async function verifyPinByUserId({
  userId,
  pin,
  type,
}: {
  userId: string;
  pin: string;
  type: "verification" | "reset";
}): Promise<{ valid: boolean; email?: string; error?: string }> {
  try {
    // Get user email
    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return { valid: false, error: "User not found" };
    }

    const email = user[0].email;

    // Verify PIN using email
    const result = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email),
          eq(verification.value, pin),
          eq(verification.type, `pin-${type}`),
          gt(verification.expiresAt as any, new Date() as any)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { valid: false, error: "Invalid or expired PIN" };
    }

    // Update user verification status if applicable
    if (type === "verification") {
      await db
        .update(users)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Delete used PIN
    await db
      .delete(verification)
      .where(eq(verification.id, result[0].id));

    return { valid: true, email };
  } catch (error) {
    console.error("Error verifying PIN by user ID:", error);
    return { valid: false, error: "Verification failed" };
  }
}

/**
 * Create and send PIN for a registered user (by user ID)
 */
export async function createAndSendPinForUser({
  userId,
  type,
}: {
  userId: string;
  type: "verification" | "reset";
}): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    // Get user email
    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: "User not found" };
    }

    const email = user[0].email;
    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store PIN in database
    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: email,
      value: pin,
      expiresAt: expiresAt,
      type: `pin-${type}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send PIN via email
    await sendPinEmail({ to: email, pin, type });

    return { success: true, email };
  } catch (error) {
    console.error("Error creating PIN for user:", error);
    return { success: false, error: "Failed to create PIN" };
  }
}

/**
 * Get verification status for a user
 */
export async function getUserVerificationStatus(userId: string): Promise<{
  userId: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return {
      userId: user[0].id,
      email: user[0].email,
      emailVerified: user[0].emailVerified,
      createdAt: user[0].createdAt,
      updatedAt: user[0].updatedAt,
    };
  } catch (error) {
    console.error("Error getting user verification status:", error);
    return null;
  }
}

/**
 * Clear expired PINs from database
 */
export async function clearExpiredPins(): Promise<{ cleared: number }> {
  try {
    const result = await db
      .delete(verification)
      .where(lt(verification.expiresAt as any, new Date() as any));

    return { cleared: result.rowsAffected ?? 0 };
  } catch (error) {
    console.error("Error clearing expired PINs:", error);
    return { cleared: 0 };
  }
}

/**
 * Check if user can request a new PIN (2-minute rate limit)
 */
export async function canRequestNewPin(email: string): Promise<{
  canRequest: boolean;
  secondsUntilNextRequest?: number;
  error?: string;
}> {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    // Check if there's a recent PIN request for this email
    const recentPin = await db
      .select({ createdAt: verification.createdAt })
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email),
          gt(verification.createdAt, twoMinutesAgo)
        )
      )
      .limit(1);

    if (recentPin.length === 0) {
      return { canRequest: true };
    }

    // Calculate seconds remaining
    const lastRequestTime = new Date(recentPin[0].createdAt!);
    const nextRequestTime = new Date(lastRequestTime.getTime() + 2 * 60 * 1000);
    const secondsUntil = Math.ceil(
      (nextRequestTime.getTime() - now.getTime()) / 1000
    );

    return {
      canRequest: false,
      secondsUntilNextRequest: Math.max(1, secondsUntil),
      error: `Please wait ${Math.max(1, secondsUntil)} second(s) before requesting a new PIN`,
    };
  } catch (error) {
    console.error("Error checking PIN request eligibility:", error);
    return {
      canRequest: false,
      error: "Failed to check PIN request status",
    };
  }
}

/**
 * Create and send PIN with rate limiting (2-minute cooldown)
 */
export async function createAndSendPinWithRateLimit({
  email,
  type,
}: {
  email: string;
  type: "verification" | "reset";
}): Promise<{
  success: boolean;
  pin?: string;
  secondsUntilNextRequest?: number;
  error?: string;
}> {
  try {
    // Check if user can request a new PIN
    const eligibility = await canRequestNewPin(email);

    if (!eligibility.canRequest) {
      return {
        success: false,
        secondsUntilNextRequest: eligibility.secondsUntilNextRequest,
        error: eligibility.error,
      };
    }

    // Proceed with PIN creation
    const result = await createAndSendPin({ email, type });

    return {
      success: result,
      error: result ? undefined : "Failed to send PIN email",
    };
  } catch (error) {
    console.error("Error creating PIN with rate limit:", error);
    return {
      success: false,
      error: "Failed to create PIN",
    };
  }
}
