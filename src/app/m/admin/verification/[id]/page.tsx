'use client';

import { useEffect, useState } from 'react';
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
  Loader,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mobileApi } from '@/lib/mobile-api-client';

interface VerificationDetail {
  id: string;
  userId: string;
  status: string;
  governmentIdUrl?: string;
  signatureUrl?: string;
  completionPercentage?: string;
  submittedAt?: string;
  processedAt?: string;
}

export default function MobileAdminVerificationDetail() {
  const params = useParams();
  const verificationId = params.id as string;

  const [verification, setVerification] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadVerificationDetail();
  }, [verificationId]);

  const loadVerificationDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getUserVerification(verificationId);

      if (response.success) {
        setVerification(response.data);
      } else {
        setError(response.error || 'Failed to load verification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification');
      console.error('Verification detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVerification = async () => {
    try {
      setApproving(true);
      const response = await mobileApi.admin.updateUserVerification(
        verification!.userId,
        { status: 'verified' }
      );

      if (response.success) {
        setVerification((prev) =>
          prev ? { ...prev, status: 'verified' } : null
        );
        alert('Verification approved successfully');
      } else {
        alert(response.error || 'Failed to approve verification');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve verification');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectVerification = async () => {
    try {
      setApproving(true);
      const response = await mobileApi.admin.updateUserVerification(
        verification!.userId,
        { status: 'rejected' }
      );

      if (response.success) {
        setVerification((prev) =>
          prev ? { ...prev, status: 'rejected' } : null
        );
        alert('Verification rejected');
      } else {
        alert(response.error || 'Failed to reject verification');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject verification');
    } finally {
      setApproving(false);
    }
  };

  if (error && !verification) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/m/admin/verification">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadVerificationDetail}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center">
        <Loader className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="w-full p-4">
        <Link href="/m/admin/verification">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-muted-foreground mt-4">Verification not found</p>
      </div>
    );
  }

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
          <p className="text-xs text-muted-foreground">{verification.userId}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Status</p>
                <Badge variant="secondary">{verification.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Completion</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          parseInt(verification.completionPercentage || '0') || 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs font-medium">
                    {verification.completionPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        {(verification.governmentIdUrl || verification.signatureUrl) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {verification.governmentIdUrl && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Government ID</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={verification.governmentIdUrl} target="_blank" rel="noopener">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}
              {verification.signatureUrl && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Signature</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={verification.signatureUrl} target="_blank" rel="noopener">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Decision */}
        {verification.status === 'pending' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Make Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleApproveVerification}
                disabled={approving}
              >
                <CheckCircle className="w-4 h-4" />
                {approving ? 'Processing...' : 'Approve Verification'}
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleRejectVerification}
                disabled={approving}
              >
                <XCircle className="w-4 h-4" />
                {approving ? 'Processing...' : 'Reject Verification'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
