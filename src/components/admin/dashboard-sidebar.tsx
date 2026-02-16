"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Settings,
  LogOut,
  GalleryVerticalEnd,
  LayoutDashboard,
  Home,
  BarChart3,
  Music,
  Upload,
  Flag,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const sidebarNavItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Dashboard",
  },
];

const adminNavItems = [
  {
    href: "/admin/users",
    icon: Users,
    label: "User Management",
    description: "Manage users, roles, permissions",
  },
  {
    href: "/admin/songs",
    icon: Music,
    label: "Songs Management",
    description: "View and manage songs",
  },
  {
    href: "/admin/upload",
    icon: Upload,
    label: "Upload Songs",
    description: "Upload new music",
  },
  {
    href: "/admin/moderation",
    icon: Flag,
    label: "Moderation",
    description: "Review flagged content",
  },
  {
    href: "/admin/reports",
    icon: BarChart3,
    label: "Reports",
    description: "Analytics and logs",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Settings",
    description: "Admin preferences",
  },
  {
    href: "/admin/more",
    icon: LayoutDashboard,
    label: "More",
    description: "Explore all features",
  },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user ?? { name: "", email: "" };
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/auth/sign");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <GalleryVerticalEnd className="w-6 h-6" />
      </button>
      {/* Overlay for mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      )}
      <Sidebar
        collapsible="offcanvas"
        variant="inset"
        className={
          `border-r bg-sidebar-primary/95 backdrop-blur-md min-h-screen
          fixed top-0 left-0 z-50 w-64 h-full transition-transform duration-300
          md:static md:translate-x-0 md:w-64
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:!block`
        }
        style={{ maxWidth: 280 }}
        onClick={() => open && setOpen(false)}
      >
      <SidebarHeader>
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            {/* Avatar or fallback icon */}
            <GalleryVerticalEnd className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg truncate max-w-[120px]">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</span>
          </div>
        </div>
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <span className="text-2xl">×</span>
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/admin/settings">
                <Settings className="h-5 w-5" />
                <span className="ml-2">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              className="cursor-pointer"
            >
              <button onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}

export default DashboardSidebar;
