"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Music, Settings, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/desk",
    icon: Home,
    label: "Home",
  },
  {
    href: "/desk/artist",
    icon: Users,
    label: "Artists",
  },
  {
    href: "/desk/songs",
    icon: Music,
    label: "Songs",
  },
  {
    href: "/desk/artist/hub",
    icon: LayoutGrid,
    label: "Hub",
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden flex justify-center"
      aria-label="Mobile navigation bar"
    >
      <div
        className="w-full max-w-md mx-auto mb-4 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl flex items-center justify-around px-2 py-3"
        style={{ minWidth: 320 }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-primary/10 text-primary shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              tabIndex={0}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform",
                  isActive && "scale-110"
                )}
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
