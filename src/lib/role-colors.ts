/**
 * Role color utilities for badges and UI elements
 */

export type RoleColorScheme = {
  badge: string;
  light: string;
  dark: string;
  gradient: string;
  hex: string;
  text: string;
  border: string;
};

/**
 * Get comprehensive color scheme for a role
 */
export function getRoleColors(role: string | undefined): RoleColorScheme {
  const colorSchemes: Record<string, RoleColorScheme> = {
    guest: {
      badge: "bg-gray-500",
      light: "bg-gray-100 dark:bg-gray-800",
      dark: "bg-gray-700 dark:bg-gray-600",
      gradient: "from-gray-400 to-gray-600",
      hex: "#6B7280",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-300 dark:border-gray-600",
    },
    new: {
      badge: "bg-blue-500",
      light: "bg-blue-100 dark:bg-blue-900",
      dark: "bg-blue-700 dark:bg-blue-600",
      gradient: "from-blue-400 to-blue-600",
      hex: "#3B82F6",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-300 dark:border-blue-600",
    },
    member: {
      badge: "bg-green-500",
      light: "bg-green-100 dark:bg-green-900",
      dark: "bg-green-700 dark:bg-green-600",
      gradient: "from-green-400 to-green-600",
      hex: "#10B981",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-300 dark:border-green-600",
    },
    artist: {
      badge: "bg-purple-500",
      light: "bg-purple-100 dark:bg-purple-900",
      dark: "bg-purple-700 dark:bg-purple-600",
      gradient: "from-purple-400 to-purple-600",
      hex: "#8B5CF6",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-300 dark:border-purple-600",
    },
    band: {
      badge: "bg-indigo-500",
      light: "bg-indigo-100 dark:bg-indigo-900",
      dark: "bg-indigo-700 dark:bg-indigo-600",
      gradient: "from-indigo-400 to-indigo-600",
      hex: "#6366F1",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-300 dark:border-indigo-600",
    },
    studio: {
      badge: "bg-cyan-500",
      light: "bg-cyan-100 dark:bg-cyan-900",
      dark: "bg-cyan-700 dark:bg-cyan-600",
      gradient: "from-cyan-400 to-cyan-600",
      hex: "#06B6D4",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-300 dark:border-cyan-600",
    },
    choir: {
      badge: "bg-pink-500",
      light: "bg-pink-100 dark:bg-pink-900",
      dark: "bg-pink-700 dark:bg-pink-600",
      gradient: "from-pink-400 to-pink-600",
      hex: "#EC4899",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-300 dark:border-pink-600",
    },
    group: {
      badge: "bg-violet-500",
      light: "bg-violet-100 dark:bg-violet-900",
      dark: "bg-violet-700 dark:bg-violet-600",
      gradient: "from-violet-400 to-violet-600",
      hex: "#8B5CF6",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-300 dark:border-violet-600",
    },
    community: {
      badge: "bg-fuchsia-500",
      light: "bg-fuchsia-100 dark:bg-fuchsia-900",
      dark: "bg-fuchsia-700 dark:bg-fuchsia-600",
      gradient: "from-fuchsia-400 to-fuchsia-600",
      hex: "#D946EF",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
      border: "border-fuchsia-300 dark:border-fuchsia-600",
    },
    label: {
      badge: "bg-teal-500",
      light: "bg-teal-100 dark:bg-teal-900",
      dark: "bg-teal-700 dark:bg-teal-600",
      gradient: "from-teal-400 to-teal-600",
      hex: "#14B8A6",
      text: "text-teal-700 dark:text-teal-300",
      border: "border-teal-300 dark:border-teal-600",
    },
    editor: {
      badge: "bg-yellow-500",
      light: "bg-yellow-100 dark:bg-yellow-900",
      dark: "bg-yellow-700 dark:bg-yellow-600",
      gradient: "from-yellow-400 to-yellow-600",
      hex: "#EAB308",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-300 dark:border-yellow-600",
    },
    manager: {
      badge: "bg-amber-500",
      light: "bg-amber-100 dark:bg-amber-900",
      dark: "bg-amber-700 dark:bg-amber-600",
      gradient: "from-amber-400 to-amber-600",
      hex: "#F59E0B",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-300 dark:border-amber-600",
    },
    admin: {
      badge: "bg-red-500",
      light: "bg-red-100 dark:bg-red-900",
      dark: "bg-red-700 dark:bg-red-600",
      gradient: "from-red-400 to-red-600",
      hex: "#EF4444",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-300 dark:border-red-600",
    },
    sadmin: {
      badge: "bg-gradient-to-r from-purple-500 to-pink-500",
      light: "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900",
      dark: "bg-gradient-to-r from-purple-700 to-pink-700",
      gradient: "from-purple-500 to-pink-500",
      hex: "#A855F7",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-300 dark:border-pink-600",
    },
  };

  return colorSchemes[role || "guest"] || colorSchemes.guest;
}

/**
 * Get role badge component classes
 */
export function getRoleBadgeClasses(role: string | undefined): string {
  const colors = getRoleColors(role);
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} text-white`;
}

/**
 * Get role hex color for dynamic styling
 */
export function getRoleHexColor(role: string | undefined): string {
  return getRoleColors(role).hex;
}

/**
 * Generate gradient background from thumbnail
 */
export function generateHeaderGradient(thumbnailUrl?: string | null, role?: string): string {
  const roleColor = getRoleColors(role);
  
  if (thumbnailUrl) {
    // Use thumbnail as background with role color overlay
    return `linear-gradient(135deg, ${roleColor.hex}40 0%, ${roleColor.hex}80 100%), url('${thumbnailUrl}')`;
  }
  
  // Pure gradient based on role
  return `linear-gradient(135deg, ${roleColor.hex} 0%, ${adjustColor(roleColor.hex, -40)} 100%)`;
}

/**
 * Adjust color brightness (simple hex manipulation)
 */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
