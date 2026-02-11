"use server";

import { db } from "@/db";
import { verification } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { generatePin, sendPinEmail } from "./email";

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
    expiresAt,
    type: `pin-${type}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Send PIN via email
  await sendPinEmail({ to: email, pin, type });

  return true;
}

export async function verifyPin({
  email,
  pin,
  type,
}: {
  email: string;
  pin: string;
  type: "verification" | "reset";
}): Promise<{ valid: boolean; error?: string }> {
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

    // Delete used PIN
    await db
      .delete(verification)
      .where(eq(verification.id, result[0].id));

    return { valid: true };
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return { valid: false, error: "Verification failed" };
  }
}
