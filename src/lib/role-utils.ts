/**
 * Role Management Utility
 * 
 * Comprehensive role-based access control utilities based on the Blueprint specification.
 * 
 * Role Hierarchy (lowest to highest):
 * guest → new → member → artist → band → studio → label → editor → manager → admin → sadmin
 * 
 * API Classes:
 * - Class 5: member, artist, band (100/page, 60 req/min)
 * - Class 10: studio, label, editor, manager (250/page, 120 req/min)
 * - Class 20: admin (500/page, 300 req/min, see totals)
 * - Class 50: sadmin (unlimited, see totals)
 */

import { ROLES, ROLE_PERMISSIONS, UserRole, API_CLASSES } from "@/db/schema";

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY: UserRole[] = [
  "guest",
  "new",
  "member",
  "artist",
  "band",
  "studio",
  "label",
  "editor",
  "manager",
  "admin",
  "sadmin",
];

/**
 * Role categories for grouping
 */
export const ROLE_CATEGORIES = {
  UNVERIFIED: ["guest", "new"] as UserRole[],
  CONTENT_CREATORS: ["artist", "band"] as UserRole[],
  CONTENT_MANAGERS: ["studio", "label", "editor", "manager"] as UserRole[],
  ADMINISTRATORS: ["admin", "sadmin"] as UserRole[],
  VERIFIED: ["member", "artist", "band", "studio", "label", "editor", "manager", "admin", "sadmin"] as UserRole[],
};

/**
 * Get role level (0-10)
 */
export function getRoleLevel(role: UserRole | string): number {
  return ROLE_HIERARCHY.indexOf(role as UserRole);
}

/**
 * Check if role1 is higher than or equal to role2
 */
export function isRoleHigherOrEqual(role1: UserRole | string, role2: UserRole | string): boolean {
  return getRoleLevel(role1) >= getRoleLevel(role2);
}

/**
 * Check if role1 is higher than role2
 */
export function isRoleHigher(role1: UserRole | string, role2: UserRole | string): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}

/**
 * Check if user is verified (not guest or new)
 */
export function isVerified(role: UserRole | string): boolean {
  return !ROLE_CATEGORIES.UNVERIFIED.includes(role as UserRole);
}

/**
 * Check if user is a content creator
 */
export function isContentCreator(role: UserRole | string): boolean {
  return ROLE_CATEGORIES.CONTENT_CREATORS.includes(role as UserRole);
}

/**
 * Check if user is a content manager
 */
export function isContentManager(role: UserRole | string): boolean {
  return ROLE_CATEGORIES.CONTENT_MANAGERS.includes(role as UserRole);
}

/**
 * Check if user is an administrator
 */
export function isAdministrator(role: UserRole | string): boolean {
  return ROLE_CATEGORIES.ADMINISTRATORS.includes(role as UserRole);
}

/**
 * Get available roles for assignment based on assigner's role
 * Users can only assign roles lower than their own
 */
export function getAssignableRoles(assignerRole: UserRole | string): UserRole[] {
  const assignerLevel = getRoleLevel(assignerRole);
  
  // Super admin can assign all roles
  if (assignerRole === ROLES.SADMIN) {
    return ROLE_HIERARCHY.slice(2); // Exclude guest and new
  }
  
  // Admins can assign up to manager
  if (assignerRole === ROLES.ADMIN) {
    return ROLE_HIERARCHY.slice(2, -2); // Exclude guest, new, admin, sadmin
  }
  
  // Managers can assign up to editor
  if (assignerRole === ROLES.MANAGER) {
    return ROLE_HIERARCHY.slice(2, -3); // Exclude guest, new, manager, admin, sadmin
  }
  
  // Others cannot assign roles
  return [];
}

/**
 * Validate role transition
 * Checks if transitioning from oldRole to newRole is allowed
 */
export function canTransitionRole(
  oldRole: UserRole | string,
  newRole: UserRole | string,
  assignerRole: UserRole | string,
): { allowed: boolean; reason?: string } {
  // Cannot demote to guest or new
  if (newRole === ROLES.GUEST || newRole === ROLES.NEW) {
    return {
      allowed: false,
      reason: "Cannot assign guest or new roles directly",
    };
  }
  
  // Assigner must be higher than both old and new roles
  if (!isRoleHigher(assignerRole, oldRole) || !isRoleHigher(assignerRole, newRole)) {
    return {
      allowed: false,
      reason: "Insufficient permissions to modify this role",
    };
  }
  
  // Super admin can't be demoted by admin
  if (oldRole === ROLES.SADMIN && assignerRole !== ROLES.SADMIN) {
    return {
      allowed: false,
      reason: "Only super admins can modify super admin roles",
    };
  }
  
  return { allowed: true };
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole | string): string {
  const descriptions: Record<string, string> = {
    guest: "Unregistered visitor with read-only access",
    new: "Registered user pending email verification",
    member: "Verified member with basic access (API Class 5)",
    artist: "Music artist with content creation rights (API Class 5)",
    band: "Music band with content creation rights (API Class 5)",
    studio: "Recording studio with production management (API Class 10)",
    label: "Record label with content management (API Class 10)",
    editor: "Content editor with editing privileges (API Class 10)",
    manager: "Content manager with approval rights (API Class 10)",
    admin: "Administrator with full management access (API Class 20)",
    sadmin: "Super administrator with unlimited access (API Class 50)",
  };
  
  return descriptions[role] || "Unknown role";
}

/**
 * Get API class limits for a role
 */
export function getRoleLimits(role: UserRole | string): {
  apiClass: string | null;
  maxPerPage: number;
  requestsPerMin: number;
  canSeeTotals: boolean;
} {
  const permissions = ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.guest;
  
  return {
    apiClass: permissions.apiClass,
    maxPerPage: permissions.maxPerPage,
    requestsPerMin: permissions.requestsPerMin,
    canSeeTotals: permissions.canSeeTotals,
  };
}

/**
 * Format API class for display
 */
export function formatApiClass(apiClass: string | null): string {
  if (!apiClass) return "No API Access";
  
  const classNames: Record<string, string> = {
    "5": "Class 5 - Basic (100/page, 60 req/min)",
    "10": "Class 10 - Enhanced (250/page, 120 req/min)",
    "20": "Class 20 - Premium (500/page, 300 req/min)",
    "50": "Class 50 - Unlimited",
  };
  
  return classNames[apiClass] || `Class ${apiClass}`;
}

/**
 * Get role badge style (Tailwind classes)
 */
export function getRoleBadgeStyle(role: UserRole | string): {
  bg: string;
  text: string;
  border: string;
} {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    guest: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-300 dark:border-gray-600",
    },
    new: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-300 dark:border-blue-600",
    },
    member: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-300 dark:border-green-600",
    },
    artist: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-300 dark:border-purple-600",
    },
    band: {
      bg: "bg-indigo-100 dark:bg-indigo-900",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-300 dark:border-indigo-600",
    },
    studio: {
      bg: "bg-pink-100 dark:bg-pink-900",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-300 dark:border-pink-600",
    },
    label: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-300 dark:border-yellow-600",
    },
    editor: {
      bg: "bg-cyan-100 dark:bg-cyan-900",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-300 dark:border-cyan-600",
    },
    manager: {
      bg: "bg-orange-100 dark:bg-orange-900",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-600",
    },
    admin: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-300 dark:border-red-600",
    },
    sadmin: {
      bg: "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-300 dark:border-pink-600",
    },
  };
  
  return styles[role] || styles.guest;
}
