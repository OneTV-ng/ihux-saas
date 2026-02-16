import Link from "next/link";
import {
  Users,
  Music,
  Upload,
  Flag,
  BarChart3,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import Navbar from "@/components/admin/navbar";

export default function AdminDashboard() {
  const dashboardSections = [
    {
      href: "/admin/users",
      title: "User Management",
      description: "Manage users, roles, permissions",
      icon: Users,
    },
    {
      href: "/admin/songs",
      title: "Songs Management",
      description: "View and manage songs",
      icon: Music,
    },
    {
      href: "/admin/upload",
      title: "Upload Songs",
      description: "Upload new music",
      icon: Upload,
    },
    {
      href: "/admin/moderation",
      title: "Moderation",
      description: "Review flagged content",
      icon: Flag,
    },
    {
      href: "/admin/reports",
      title: "Reports",
      description: "Analytics, logs, KPIs",
      icon: BarChart3,
    },
    {
      href: "/admin/settings",
      title: "Settings",
      description: "Admin preferences",
      icon: Settings,
    },
    {
      href: "/admin/more",
      title: "More",
      description: "Explore all features",
      icon: MoreHorizontal,
    },
  ];

  return (
    <section className="flex flex-col items-center justify-center h-full w-full text-center py-12 px-4">
       <Navbar />
      <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
        Admin Dashboard
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
        Welcome to the SingFLEX Admin Hub!<br />
        Use the sidebar or cards below to navigate to all admin tools.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {dashboardSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="block"
            >
              <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer h-full flex flex-col items-center text-center">
                <Icon className="w-8 h-8 text-primary mb-3 mx-auto" />
                <span className="block text-primary font-semibold mb-2">
                  {section.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {section.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
