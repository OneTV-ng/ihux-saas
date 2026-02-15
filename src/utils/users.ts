import { db } from "@/db";
import { users as userTable, account as accountTable, sessions as sessionTable, usersVerification, User } from "@/db/schema";
import { eq, like, or, sql, desc, asc, and, inArray } from "drizzle-orm";

export interface UserWithDetails {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  verificationStatus: string | null;
  banned: boolean;
  banReason?: string;
  banExpires?: Date | null;
  accounts: string[];
  lastSignIn: Date | null;
  createdAt: Date;
  avatarUrl: string;
  role?: string;
}

export interface GetUsersOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  status?: string;
  email?: string;
  name?: string;
  search?: string;
}

export async function getUsers(
  options: GetUsersOptions = {},
): Promise<{ users: UserWithDetails[]; total: number }> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;

  // Build WHERE conditions
  const conditions = [];

  // Role filter
  if (options.role) {
    conditions.push(eq(userTable.role, options.role as typeof userTable.role.enumValues[number]));
  }

  // Status filter (active/banned)
  if (options.status === "banned") {
    conditions.push(eq(userTable.banned, true));
  } else if (options.status === "active") {
    conditions.push(eq(userTable.banned, false));
  }

  // Combined search (name OR email)
  if (options.search) {
    conditions.push(
      or(
        like(userTable.name, `%${options.search}%`),
        like(userTable.email, `%${options.search}%`)
      )!
    );
  } else {
    // Individual field searches
    if (options.email) {
      conditions.push(like(userTable.email, `%${options.email}%`));
    }
    if (options.name) {
      conditions.push(like(userTable.name, `%${options.name}%`));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Determine sort column
  const sortCol =
    options.sortBy === "email" ? userTable.email :
    options.sortBy === "role" ? userTable.role :
    options.sortBy === "createdAt" ? userTable.createdAt :
    userTable.createdAt;

  const orderFn = options.sortDirection === "asc" ? asc : desc;

  // Count total
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userTable)
    .where(whereClause);
  const total = countResult[0]?.count ?? 0;

  // Fetch users
  const usersResult = await db
    .select()
    .from(userTable)
    .where(whereClause)
    .orderBy(orderFn(sortCol))
    .limit(limit)
    .offset(offset);

  if (usersResult.length === 0) {
    return { users: [], total };
  }

  const userIds = usersResult.map((u: User) => u.id);

  // Fetch accounts for these users only
  const accountsResult = await db
    .select({ userId: accountTable.userId, providerId: accountTable.providerId })
    .from(accountTable)
    .where(inArray(accountTable.userId, userIds));

  // Fetch latest session per user
  const sessionsResult = await db
    .select({ userId: sessionTable.userId, createdAt: sessionTable.createdAt })
    .from(sessionTable)
    .where(inArray(sessionTable.userId, userIds));

  // Fetch verification status per user
  const verificationResult = await db
    .select({ userId: usersVerification.userId, status: usersVerification.status })
    .from(usersVerification)
    .where(inArray(usersVerification.userId, userIds));

  // Group accounts by user
  const accountsByUser: Record<string, string[]> = {};
  for (const acc of accountsResult) {
    if (!accountsByUser[acc.userId]) accountsByUser[acc.userId] = [];
    accountsByUser[acc.userId].push(acc.providerId);
  }

  // Get last sign-in per user
  const lastSignInByUser: Record<string, Date> = {};
  for (const sess of sessionsResult) {
    if (!lastSignInByUser[sess.userId] || sess.createdAt > lastSignInByUser[sess.userId]) {
      lastSignInByUser[sess.userId] = sess.createdAt;
    }
  }

  // Map verification status by user
  const verificationByUser: Record<string, string> = {};
  for (const v of verificationResult) {
    verificationByUser[v.userId] = v.status;
  }

  const users: UserWithDetails[] = usersResult.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    verificationStatus: verificationByUser[u.id] || null,
    role: u.role,
    banned: u.banned,
    banReason: u.banReason || "",
    banExpires: u.banExpires || null,
    accounts: accountsByUser[u.id] || [],
    lastSignIn: lastSignInByUser[u.id] || null,
    createdAt: u.createdAt,
    avatarUrl: u.image || "",
  }));

  return { users, total };
}
