import { randomUUID } from "crypto";
import { db } from "@/db";
import { usersVerification } from "@/db/schema";
import { eq } from "drizzle-orm";

export type VerificationStatus = 
  | "updating" 
  | "submitted" 
  | "processing" 
  | "flagged" 
  | "rejected" 
  | "suspended" 
  | "verified";

export interface UserVerificationData {
  id: string;
  userId: string;
  status: VerificationStatus;
  submittedAt: Date | null;
  processedAt: Date | null;
  verifiedAt: Date | null;
  remark: string | null;
  rejectionReason: string | null;
  flagReason: string | null;
  reviewedBy: string | null;
  governmentIdUrl: string | null;
  signatureUrl: string | null;
  completionPercentage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get user verification record by user ID
 */
export async function getUserVerification(userId: string): Promise<UserVerificationData | null> {
  const records = await db
    .select()
    .from(usersVerification)
    .where(eq(usersVerification.userId, userId))
    .limit(1);

  return (records[0] as UserVerificationData) || null;
}

/**
 * Create a new verification record for a user
 */
export async function createUserVerification(
  userId: string,
  data?: {
    governmentIdUrl?: string;
    signatureUrl?: string;
    completionPercentage?: string;
  }
): Promise<UserVerificationData> {
  const id = randomUUID();

  await db
    .insert(usersVerification)
    .values({
      id,
      userId,
      status: "updating",
      governmentIdUrl: data?.governmentIdUrl || null,
      signatureUrl: data?.signatureUrl || null,
      completionPercentage: data?.completionPercentage || "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const [record] = await db
    .select()
    .from(usersVerification)
    .where(eq(usersVerification.id, id));

  return record as UserVerificationData;
}

/**
 * Update verification status
 */
export async function updateVerificationStatus(
  userId: string,
  status: VerificationStatus,
  options?: {
    remark?: string;
    rejectionReason?: string;
    flagReason?: string;
    reviewedBy?: string;
  }
): Promise<UserVerificationData | null> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  // Set timestamps based on status
  if (status === "submitted" && !options) {
    updateData.submittedAt = new Date();
  }
  
  if (status === "processing") {
    updateData.processedAt = new Date();
  }
  
  if (status === "verified") {
    updateData.verifiedAt = new Date();
  }

  // Add optional fields
  if (options?.remark) updateData.remark = options.remark;
  if (options?.rejectionReason) updateData.rejectionReason = options.rejectionReason;
  if (options?.flagReason) updateData.flagReason = options.flagReason;
  if (options?.reviewedBy) updateData.reviewedBy = options.reviewedBy;

  await db
    .update(usersVerification)
    .set(updateData)
    .where(eq(usersVerification.userId, userId));

  const [updated] = await db
    .select()
    .from(usersVerification)
    .where(eq(usersVerification.userId, userId));

  return (updated as UserVerificationData) || null;
}

/**
 * Update verification documents
 */
export async function updateVerificationDocuments(
  userId: string,
  data: {
    governmentIdUrl?: string;
    signatureUrl?: string;
    completionPercentage?: string;
  }
): Promise<UserVerificationData | null> {
  await db
    .update(usersVerification)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(usersVerification.userId, userId));

  const [updated] = await db
    .select()
    .from(usersVerification)
    .where(eq(usersVerification.userId, userId));

  return (updated as UserVerificationData) || null;
}

/**
 * Submit verification for review
 */
export async function submitVerification(userId: string): Promise<UserVerificationData | null> {
  return updateVerificationStatus(userId, "submitted");
}

/**
 * Approve verification
 */
export async function approveVerification(
  userId: string,
  reviewedBy: string,
  remark?: string
): Promise<UserVerificationData | null> {
  return updateVerificationStatus(userId, "verified", { reviewedBy, remark });
}

/**
 * Reject verification
 */
export async function rejectVerification(
  userId: string,
  reviewedBy: string,
  rejectionReason: string
): Promise<UserVerificationData | null> {
  return updateVerificationStatus(userId, "rejected", { reviewedBy, rejectionReason });
}

/**
 * Flag verification for review
 */
export async function flagVerification(
  userId: string,
  reviewedBy: string,
  flagReason: string
): Promise<UserVerificationData | null> {
  return updateVerificationStatus(userId, "flagged", { reviewedBy, flagReason });
}

/**
 * Suspend user verification
 */
export async function suspendVerification(
  userId: string,
  reviewedBy: string,
  remark: string
): Promise<UserVerificationData | null> {
  return updateVerificationStatus(userId, "suspended", { reviewedBy, remark });
}

/**
 * Get verification statistics
 */
export async function getVerificationStats() {
  const allRecords = await db.select().from(usersVerification);
  
  const stats = {
    total: allRecords.length,
    updating: 0,
    submitted: 0,
    processing: 0,
    flagged: 0,
    rejected: 0,
    suspended: 0,
    verified: 0,
  };

  allRecords.forEach((record: any) => {
    if (record.status in stats) {
      stats[record.status as keyof typeof stats]++;
    }
  });

  return stats;
}
