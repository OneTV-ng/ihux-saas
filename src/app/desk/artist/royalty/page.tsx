"use client";

import { useState } from "react";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Music,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RoyaltyPage = () => {
  const [timeRange, setTimeRange] = useState("30days");

  // Mock earnings data
  const earningsData = [
    { month: "Jan", earnings: 1200 },
    { month: "Feb", earnings: 1400 },
    { month: "Mar", earnings: 1100 },
    { month: "Apr", earnings: 1600 },
    { month: "May", earnings: 1800 },
    { month: "Jun", earnings: 2100 },
  ];

  const revenueStreams = [
    { source: "Streaming", amount: 4800, percentage: 60, color: "bg-blue-500" },
    { source: "Downloads", amount: 1600, percentage: 20, color: "bg-green-500" },
    { source: "YouTube", amount: 1200, percentage: 15, color: "bg-red-500" },
    { source: "Other", amount: 400, percentage: 5, color: "bg-gray-500" },
  ];

  const recentPayments = [
    {
      id: 1,
      date: "2024-02-01",
      amount: 2100,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: 2,
      date: "2024-01-01",
      amount: 1800,
      status: "completed",
      method: "PayPal",
    },
    {
      id: 3,
      date: "2023-12-01",
      amount: 1600,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: 4,
      date: "2023-11-01",
      amount: 1100,
      status: "completed",
      method: "PayPal",
    },
  ];

  const topTracks = [
    {
      title: "Midnight Dreams",
      plays: 125000,
      earnings: 850,
      trend: "up",
    },
    {
      title: "Ocean Breeze",
      plays: 98000,
      earnings: 665,
      trend: "up",
    },
    {
      title: "City Lights",
      plays: 87000,
      earnings: 590,
      trend: "down",
    },
    {
      title: "Thunder Road",
      plays: 76000,
      earnings: 515,
      trend: "up",
    },
  ];

  const stats = [
    {
      label: "Total Earnings",
      value: "$8,000",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      label: "This Month",
      value: "$2,100",
      change: "+8.2%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Pending",
      value: "$540",
      change: "Next payout",
      icon: Wallet,
      trend: "neutral",
    },
    {
      label: "Total Plays",
      value: "1.2M",
      change: "+15.3%",
      icon: Music,
      trend: "up",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Royalty Dashboard</h1>
            <p className="text-muted-foreground">
              Track your earnings and payment history
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" && (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    )}
                    {stat.trend === "down" && (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.trend === "up"
                          ? "text-green-500"
                          : stat.trend === "down"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Earnings Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
            <CardDescription>
              Your revenue trend for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Streams */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Streams</CardTitle>
            <CardDescription>
              Breakdown of your earnings by source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueStreams.map((stream, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stream.source}</span>
                    <span className="text-muted-foreground">
                      ${stream.amount.toLocaleString()} ({stream.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`${stream.color} h-2 rounded-full transition-all`}
                      style={{ width: `${stream.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="tracks">Top Earning Tracks</TabsTrigger>
          </TabsList>

          {/* Payment History Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Your payment history and transaction records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {payment.date}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Tracks Tab */}
          <TabsContent value="tracks">
            <Card>
              <CardHeader>
                <CardTitle>Top Earning Tracks</CardTitle>
                <CardDescription>
                  Your best performing songs by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track</TableHead>
                      <TableHead className="text-right">Plays</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topTracks.map((track, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
                              <Music className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{track.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {track.plays.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${track.earnings}
                        </TableCell>
                        <TableCell className="text-right">
                          {track.trend === "up" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500 inline" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 inline" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>
              Manage your payout preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Minimum Payout</p>
                  <p className="text-sm text-muted-foreground">
                    Receive payments when balance reaches $100
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    Bank Transfer (••••4242)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Payment Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    Monthly (1st of each month)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default RoyaltyPage;
