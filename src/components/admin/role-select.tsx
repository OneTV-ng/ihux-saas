"use client";

import { getRoleColors } from "@/lib/role-colors";
import { getAssignableRoles, getRoleDescription, ROLE_CATEGORIES } from "@/lib/role-utils";
import type { UserRole } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  assignerRole: string;
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  VERIFIED_BASIC: "Basic",
  CONTENT_CREATORS: "Content Creators",
  CONTENT_MANAGERS: "Content Managers",
  ADMINISTRATORS: "Administrators",
};

function getRoleCategory(role: UserRole): string {
  if (ROLE_CATEGORIES.ADMINISTRATORS.includes(role)) return "ADMINISTRATORS";
  if (ROLE_CATEGORIES.CONTENT_MANAGERS.includes(role)) return "CONTENT_MANAGERS";
  if (ROLE_CATEGORIES.CONTENT_CREATORS.includes(role)) return "CONTENT_CREATORS";
  return "VERIFIED_BASIC";
}

export function RoleSelect({ value, onValueChange, assignerRole, disabled }: RoleSelectProps) {
  const assignable = getAssignableRoles(assignerRole);

  const grouped = assignable.reduce<Record<string, UserRole[]>>((acc, role) => {
    const cat = getRoleCategory(role);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(role);
    return acc;
  }, {});

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(grouped).map(([category, roles]) => (
          <div key={category}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {CATEGORY_LABELS[category] || category}
            </div>
            {roles.map((role) => {
              const colors = getRoleColors(role);
              return (
                <SelectItem key={role} value={role}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: colors.hex }}
                    />
                    <span className="capitalize">{role}</span>
                    <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
                      {getRoleDescription(role).split("(")[0].trim()}
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
