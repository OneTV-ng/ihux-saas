import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, Globe } from "lucide-react";

export default function AdminKPI() {
  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">System KPIs</h1>
        <p className="text-muted-foreground mt-1">Monitor system health and performance indicators.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.98%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Load</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">Peak usage today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Global availability</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="h-[300px]">
            <CardHeader>
                <CardTitle>Traffic Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed m-4 rounded bg-muted/20">
                <span className="text-sm">Traffic Chart Placeholder</span>
            </CardContent>
         </Card>
         <Card className="h-[300px]">
            <CardHeader>
                <CardTitle>Error Rates</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed m-4 rounded bg-muted/20">
                <span className="text-sm">Error Rate Chart Placeholder</span>
            </CardContent>
         </Card>
      </div>
    </section>
  );
}
