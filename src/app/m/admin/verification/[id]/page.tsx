import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminVerificationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const verification = {
    id: '1',
    user: 'John Doe',
    email: 'john@example.com',
    type: 'Artist',
    status: 'pending',
    submittedDate: '2024-02-10',
    documents: [
      { type: 'Government ID', url: '#', status: 'verified' },
      { type: 'Signature', url: '#', status: 'verified' },
      { type: 'Proof of Address', url: '#', status: 'pending' },
    ],
    notes: 'Documents appear legitimate. Pending final review.',
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10 flex items-center gap-3">
        <Link href="/m/admin/verification">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">Review Verification</h1>
          <p className="text-xs text-muted-foreground">{verification.user}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-semibold">{verification.user}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-sm">{verification.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{verification.type}</Badge>
                <Badge variant="secondary">{verification.submittedDate}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {verification.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.status === 'verified' ? 'Verified' : 'Pending Review'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{verification.notes}</p>
          </CardContent>
        </Card>

        {/* Decision */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Make Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4" />
              Approve Verification
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <AlertCircle className="w-4 h-4" />
              Flag for Review
            </Button>
            <Button variant="destructive" className="w-full gap-2">
              <XCircle className="w-4 h-4" />
              Reject Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
