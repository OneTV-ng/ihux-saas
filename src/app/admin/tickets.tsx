import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare } from "lucide-react";

export default function AdminTickets() {
  const tickets = [
    { id: "T-1001", subject: "Login Issue", user: "user1@example.com", priority: "High", status: "Open", date: "2023-10-25" },
    { id: "T-1002", subject: "Billing Question", user: "user2@example.com", priority: "Medium", status: "In Progress", date: "2023-10-24" },
    { id: "T-1003", subject: "Feature Request", user: "user3@example.com", priority: "Low", status: "Closed", date: "2023-10-22" },
  ];

  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">Manage user support requests and issues.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.user}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.priority === "High" ? "destructive" : "outline"}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === "Open" ? "default" : ticket.status === "Closed" ? "secondary" : "outline"}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" /> Reply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
