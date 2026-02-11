import { getServerUser } from "@/lib/auth-server";
import { ROLES, ROLE_PERMISSIONS, UserRole } from "@/db/schema";
import { NextRequest } from "next/server";

export interface RoleMiddlewareOptions {
  allowedRoles?: UserRole[];
  minRole?: UserRole;
  requireAuth?: boolean;
}

/**
 * Role-based access control middleware for API routes
 */
export async function withRoleAuth(
  handler: (req: NextRequest, context?: any) => Promise<Response>,
  options: RoleMiddlewareOptions = {},
) {
  return async (req: NextRequest, context?: any) => {
    const { allowedRoles, minRole, requireAuth = true } = options;

    // Get current user
    const user = await getServerUser();

    // Check authentication requirement
    if (requireAuth && !user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check specific role requirements
    if (allowedRoles && user) {
      const userRole = user.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        return Response.json(
          {
            error: "Insufficient permissions",
            required: allowedRoles,
            current: userRole,
          },
          { status: 403 },
        );
      }
    }

    // Check minimum role requirement
    if (minRole && user) {
      const userRole = user.role as UserRole;
      const userPermissions = ROLE_PERMISSIONS[userRole];
      const minPermissions = ROLE_PERMISSIONS[minRole];

      if (!userPermissions || !minPermissions || userPermissions.powerLevel < minPermissions.powerLevel) {
        return Response.json(
          {
            error: "Insufficient permissions",
            required: minRole,
            current: userRole,
          },
          { status: 403 },
        );
      }
    }

    // Call the handler
    return handler(req, context);
  };
}

/**
 * Check if user has permission for specific action
 */
export function hasPermission(
  role: UserRole | undefined,
  action: keyof typeof ROLE_PERMISSIONS.guest,
): boolean {
  if (!role) {
    return ROLE_PERMISSIONS.guest[action] as boolean;
  }

  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest;
  return !!permissions[action];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string | undefined): string {
  const roleNames: Record<string, string> = {
    guest: "Guest",
    new: "New User",
    member: "Member",
    artist: "Artist",
    band: "Band",
    studio: "Studio",
    choir: "Choir",
    group: "Group",
    community: "Community",
    label: "Label",
    editor: "Editor",
    manager: "Manager",
    admin: "Admin",
    sadmin: "Super Admin",
  };

  return roleNames[role || "guest"] || "Unknown";
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: string | undefined): string {
  const colors: Record<string, string> = {
    guest: "bg-gray-500",
    new: "bg-blue-500",
    member: "bg-green-500",
    artist: "bg-purple-500",
    band: "bg-indigo-500",
    studio: "bg-cyan-500",
    choir: "bg-pink-500",
    group: "bg-violet-500",
    community: "bg-fuchsia-500",
    label: "bg-teal-500",
    editor: "bg-yellow-500",
    manager: "bg-amber-500",
    admin: "bg-red-500",
    sadmin: "bg-gradient-to-r from-purple-500 to-pink-500",
  };

  return colors[role || "guest"] || "bg-gray-500";
}

/**
 * Get API class display name
 */
export function getApiClassDisplayName(apiClass: string | null | undefined): string {
  const classNames: Record<string, string> = {
    "5": "Class 5 - Basic (100/page, 60 req/min)",
    "10": "Class 10 - Standard (250/page, 120 req/min)",
    "20": "Class 20 - Advanced (500/page, 300 req/min)",
    "30": "Class 30 - Premium (1000/page, 600 req/min)",
    "50": "Class 50 - Unlimited",
  };

  return classNames[apiClass || ""] || "No API Access";
}
