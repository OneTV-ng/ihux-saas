"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function MobileSidebarToggle() {
  const { toggleSidebar, open, openMobile } = useSidebar();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className={cn(
        "h-10 w-10 rounded-lg border-2 md:hidden transition-all duration-200",
        (open || openMobile) ? "bg-primary/10 border-primary" : "hover:bg-accent"
      )}
      aria-label="Toggle sidebar"
    >
      {(open || openMobile) ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );
}
