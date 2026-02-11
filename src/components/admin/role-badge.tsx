"use client";

import { getRoleBadgeClasses } from "@/lib/role-colors";

interface RoleBadgeProps {
  role: string | undefined;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const displayName = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Guest";

  return (
    <span className={`${getRoleBadgeClasses(role)} ${className ?? ""}`}>
      {displayName}
    </span>
  );
}
