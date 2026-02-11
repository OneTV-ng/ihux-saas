import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, FileText } from "lucide-react";

export default function AdminVerification() {
  const requests = [
    { id: 1, user: "John Doe", email: "john@example.com", type: "Artist", status: "Pending", date: "2023-10-25" },
    { id: 2, user: "Jane Smith", email: "jane@example.com", type: "Label", status: "Pending", date: "2023-10-24" },
    { id: 3, user: "Mike Johnson", email: "mike@example.com", type: "Artist", status: "Rejected", date: "2023-10-23" },
  ];

  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">User Verification</h1>
        <p className="text-muted-foreground mt-1">Review identity verification requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.user}</TableCell>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>{req.date}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === "Pending" ? "secondary" : "destructive"}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Documents">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Approve">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Reject">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
