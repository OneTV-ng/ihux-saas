'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, AlertCircle, Clock, Loader } from 'lucide-react';
import Link from 'next/link';
import { mobileApi } from '@/lib/mobile-api-client';

interface Verification {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'flagged' | 'verified' | 'rejected';
  submittedAt?: string;
  completionPercentage?: string;
}

interface VerificationWithUser extends Verification {
  userName?: string;
  userEmail?: string;
}

export default function MobileAdminVerification() {
  const [verifications, setVerifications] = useState<VerificationWithUser[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getUsers(1, 100);

      if (response.success) {
        const users = response.data?.users || response.data || [];
        // Fetch verification data for each user
        const verificationsData: VerificationWithUser[] = [];

        for (const user of users) {
          const verifResponse = await mobileApi.admin.getUserVerification(
            user.id
          );
          if (verifResponse.success) {
            verificationsData.push({
              ...verifResponse.data,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            });
          }
        }

        setVerifications(verificationsData);
      } else {
        setError(response.error || 'Failed to load verifications');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load verifications'
      );
      console.error('Verification load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: 'secondary', icon: Clock },
    processing: { color: 'secondary', icon: Clock },
    flagged: { color: 'destructive', icon: AlertCircle },
    verified: { color: 'default', icon: Clock },
    rejected: { color: 'destructive', icon: AlertCircle },
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Verification</h1>
        <p className="text-xs text-muted-foreground mb-4">
          Review and manage user verifications
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'flagged', 'verified'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs whitespace-nowrap"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4">
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadVerifications}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-4 flex justify-center">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {/* Verification List */}
      {!loading && !error && (
        <div className="p-4 space-y-3">
          {filteredVerifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No verifications found</p>
              </CardContent>
            </Card>
          ) : (
            filteredVerifications.map((verification) => {
              const config =
                statusConfig[verification.status] ||
                statusConfig['pending'];
              const StatusIcon = config.icon;

              return (
                <Card
                  key={verification.id}
                  className="cursor-pointer hover:bg-accent transition"
                >
                  <Link href={`/m/admin/verification/${verification.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">
                              {verification.userName || 'Unknown'}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {verification.userEmail}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {(
                                parseInt(
                                  verification.completionPercentage || '0'
                                ) || 0
                              ).toFixed(0)}
                              % complete
                            </Badge>
                            <Badge
                              variant={config.color as any}
                              className="text-xs"
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {verification.status}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
