import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, Shield, Database, Globe, Lock } from "lucide-react";
import Link from "next/link";

export default function MoreMock() {
  const features = [
    { title: "Audit Logs", description: "View system audit logs and security events.", icon: Shield, href: "/admin/audit" },
    { title: "Database Management", description: "Direct access to database tools and backups.", icon: Database, href: "/admin/database" },
    { title: "Global Settings", description: "Configure region-specific settings.", icon: Globe, href: "/admin/regions" },
    { title: "Access Control", description: "Manage admin roles and permissions.", icon: Lock, href: "/admin/roles" },
    { title: "Integrations", description: "Manage third-party API integrations.", icon: LinkIcon, href: "/admin/integrations" },
  ];

  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">More Features</h1>
        <p className="text-muted-foreground mt-1">Explore additional administrative tools.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Link key={index} href={feature.href} className="block h-full">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}