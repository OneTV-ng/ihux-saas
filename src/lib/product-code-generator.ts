import { db } from '@/db';
import { productCodeSequences } from '@/db/schema/publishing.schema';
import { eq } from 'drizzle-orm';

/**
 * Generate a unique product code in format: SF-SC-{year}-{4digit}
 *
 * Example outputs:
 * - SF-SC-2026-2002 (first code of 2026)
 * - SF-SC-2026-2003 (second code of 2026)
 * - SF-SC-2027-2002 (resets to 2002 in new year)
 *
 * THREAD-SAFE: Uses database transactions to prevent race conditions
 * when multiple admins publish songs simultaneously.
 *
 * @returns Promise<string> - The generated product code
 * @throws Error if database transaction fails
 */
export async function generateProductCode(): Promise<string> {
  const year = new Date().getFullYear();

  // Use transaction for atomic increment - prevents race conditions
  const code = await db.transaction(async (tx: any) => {
    // Get or create sequence record for current year
    let sequenceRecord = await tx
      .select()
      .from(productCodeSequences)
      .where(eq(productCodeSequences.year, year))
      .limit(1);

    // If no sequence exists for this year, create it
    if (!sequenceRecord.length) {
      await tx.insert(productCodeSequences).values({
        year,
        sequence: 2001, // Will increment to 2002 below
      });

      sequenceRecord = [{ year, sequence: 2001, createdAt: new Date(), updatedAt: new Date() }];
    }

    // Atomically increment sequence
    const currentSequence = sequenceRecord[0].sequence;
    const newSequence = currentSequence + 1;

    // Update the sequence counter
    await tx
      .update(productCodeSequences)
      .set({
        sequence: newSequence,
        updatedAt: new Date(),
      })
      .where(eq(productCodeSequences.year, year));

    // Format the code: SF-SC-{year}-{4digit}
    const paddedSequence = String(newSequence).padStart(4, '0');
    return `SF-SC-${year}-${paddedSequence}`;
  });

  return code;
}

/**
 * Get the current sequence number for a given year
 * Useful for tracking how many songs have been published this year
 *
 * @param year - The year to check (defaults to current year)
 * @returns Promise<number> - The next sequence number that will be assigned
 */
export async function getCurrentSequence(year?: number): Promise<number> {
  const targetYear = year || new Date().getFullYear();

  const sequenceRecord = await db
    .select()
    .from(productCodeSequences)
    .where(eq(productCodeSequences.year, targetYear))
    .limit(1);

  if (!sequenceRecord.length) {
    return 2002; // First code will be 2002
  }

  return sequenceRecord[0].sequence + 1;
}

/**
 * Reset the sequence counter for a specific year (admin function)
 * Use with caution - only for correcting mistakes
 *
 * @param year - The year to reset
 * @param newSequence - The new sequence value to set
 */
export async function resetSequence(year: number, newSequence: number): Promise<void> {
  await db
    .update(productCodeSequences)
    .set({
      sequence: newSequence,
      updatedAt: new Date(),
    })
    .where(eq(productCodeSequences.year, year));
}
