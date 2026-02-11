import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail } from "lucide-react";

export default function AdminMessaging() {
  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Messaging</h1>
        <p className="text-muted-foreground mt-1">Send notifications and messages to users.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send System Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient (Email or User ID)</label>
              <Input placeholder="All Users or specific email..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Notification Subject" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Type your message here..." className="min-h-[150px]" />
            </div>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">System Maintenance Update</p>
                    <p className="text-sm text-muted-foreground">Sent to: All Users</p>
                    <p className="text-xs text-muted-foreground">Oct 2{i}, 2023 at 10:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
