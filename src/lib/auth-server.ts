import { users, ROLES, ROLE_PERMISSIONS, UserRole } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  profilePicture?: string | null;
  headerBackground?: string | null;
  role?: string;
  apiClass?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  recordLabel?: string | null;
  socialMedia?: any;
  bankDetails?: any;
  settings?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServerSession {
  user: ServerUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Get current session (server-side)
 * Use in Server Components and Server Actions
 */
export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    return session as ServerSession;
  } catch (error) {
    console.error("Failed to get server session:", error);
    return null;
  }
}

/**
 * Get current user (server-side)
 * Use in Server Components and Server Actions
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const session = await getServerSession();
    if (!session) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Failed to get server user:", error);
    return null;
  }
}

/**
 * Get current user with full profile data (server-side)
 * Fetches complete user data from database
 */
export async function getServerUserProfile(): Promise<ServerUser | null> {
  try {
    const session = await getServerSession();
    if (!session) {
      return null;
    }

    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData || userData.length === 0) {
      return null;
    }

    return userData[0] as ServerUser;
  } catch (error) {
    console.error("Failed to get server user profile:", error);
    return null;
  }
}

/**
 * Check if current user is admin (server-side)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getServerUser();
    return user?.role === ROLES.ADMIN || user?.role === ROLES.SADMIN;
  } catch (error) {
    console.error("Failed to check admin status:", error);
    return false;
  }
}

/**
 * Check if user has specific role (server-side)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const user = await getServerUser();
    return user?.role === role;
  } catch (error) {
    console.error("Failed to check role:", error);
    return false;
  }
}

/**
 * Check if user has minimum role level (server-side)
 * Uses power level comparison from ROLE_PERMISSIONS
 */
export async function hasMinRole(minRole: UserRole): Promise<boolean> {
  try {
    const user = await getServerUser();
    if (!user?.role) return false;

    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole];
    const minPermissions = ROLE_PERMISSIONS[minRole];

    if (!userPermissions || !minPermissions) return false;

    return userPermissions.powerLevel >= minPermissions.powerLevel;
  } catch (error) {
    console.error("Failed to check min role:", error);
    return false;
  }
}

/**
 * Get user permissions based on role
 */
export async function getUserPermissions() {
  try {
    const user = await getServerUser();
    if (!user?.role) {
      return ROLE_PERMISSIONS.guest;
    }
    
    return ROLE_PERMISSIONS[user.role as UserRole] || ROLE_PERMISSIONS.guest;
  } catch (error) {
    console.error("Failed to get user permissions:", error);
    return ROLE_PERMISSIONS.guest;
  }
}

/**
 * Check if user can perform action based on permissions
 */
export async function canPerformAction(action: keyof typeof ROLE_PERMISSIONS.guest): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    return !!permissions[action];
  } catch (error) {
    console.error("Failed to check action permission:", error);
    return false;
  }
}

/**
 * Check if current user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getServerSession();
    return !!session;
  } catch (error) {
    console.error("Failed to check authentication:", error);
    return false;
  }
}

/**
 * Require authentication (server-side)
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<ServerSession> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require admin role (server-side)
 * Throws error if not admin
 */
export async function requireAdmin(): Promise<ServerSession> {
  const session = await requireAuth();
  if (session.user.role !== ROLES.ADMIN && session.user.role !== ROLES.SADMIN) {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}

/**
 * Require specific role (server-side)
 * Throws error if user doesn't have the required role
 */
export async function requireRole(role: UserRole): Promise<ServerSession> {
  const session = await requireAuth();
  if (session.user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }
  return session;
}

/**
 * Require minimum role level (server-side)
 * Throws error if user doesn't meet minimum role requirement
 */
export async function requireMinRole(minRole: UserRole): Promise<ServerSession> {
  const session = await requireAuth();
  const hasAccess = await hasMinRole(minRole);
  if (!hasAccess) {
    throw new Error(`Forbidden: Minimum ${minRole} role required`);
  }
  return session;
}
