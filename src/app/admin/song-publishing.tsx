import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Eye } from "lucide-react";

export default function AdminSongPublishing() {
  const songs = [
    { id: 1, title: "Midnight Dreams", artist: "Luna Ray", genre: "Pop", status: "Pending", date: "2023-10-25" },
    { id: 2, title: "Urban Jungle", artist: "The Beats", genre: "Hip Hop", status: "Approved", date: "2023-10-24" },
    { id: 3, title: "Ocean Waves", artist: "Calm Sounds", genre: "Ambient", status: "Rejected", date: "2023-10-23" },
    { id: 4, title: "Neon Lights", artist: "Synthwave Pro", genre: "Electronic", status: "Pending", date: "2023-10-22" },
  ];

  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Song Publishing</h1>
        <p className="text-muted-foreground mt-1">Review and manage song submissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell>{song.genre}</TableCell>
                  <TableCell>{song.date}</TableCell>
                  <TableCell>
                    <Badge variant={song.status === "Approved" ? "default" : song.status === "Rejected" ? "destructive" : "secondary"}>
                      {song.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {song.status === "Pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Approve">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Reject">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
