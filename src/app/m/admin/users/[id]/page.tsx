'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Ban,
  CheckCircle,
  ChevronLeft,
  AlertCircle,
  Loader,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mobileApi } from '@/lib/mobile-api-client';

interface UserDetail {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  address?: string;
  createdAt?: string;
}

export default function MobileAdminUserDetail() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspending, setSuspending] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getUserById(userId);

      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.error || 'Failed to load user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      console.error('User detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    try {
      setSuspending(true);
      const response = await mobileApi.admin.suspendUser(userId, suspendReason);

      if (response.success) {
        setUser((prev) =>
          prev ? { ...prev, banned: true, banReason: suspendReason } : null
        );
        setSuspendReason('');
        alert('User suspended successfully');
      } else {
        alert(response.error || 'Failed to suspend user');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to suspend user');
    } finally {
      setSuspending(false);
    }
  };

  const handleUnsuspendUser = async () => {
    try {
      setSuspending(true);
      const response = await mobileApi.admin.unsuspendUser(userId);

      if (response.success) {
        setUser((prev) =>
          prev ? { ...prev, banned: false, banReason: null } : null
        );
        alert('User unsuspended successfully');
      } else {
        alert(response.error || 'Failed to unsuspend user');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unsuspend user');
    } finally {
      setSuspending(false);
    }
  };

  if (error && !user) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/m/admin/users">
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
                onClick={loadUserDetail}
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

  if (!user) {
    return (
      <div className="w-full p-4">
        <Link href="/m/admin/users">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-muted-foreground mt-4">User not found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10 flex items-center gap-3">
        <Link href="/m/admin/users">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">User Details</h1>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">{user.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
              <Badge variant={user.banned ? 'destructive' : 'default'}>
                {user.banned ? 'suspended' : 'active'}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
              )}

              {user.role && (
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                </div>
              )}

              {user.createdAt && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suspension Card */}
        {user.banned && user.banReason && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive">
                User Suspended
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p className="text-sm">{user.banReason}</p>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={handleUnsuspendUser}
                disabled={suspending}
              >
                {suspending ? 'Processing...' : 'Unsuspend User'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {!user.banned && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Suspension Reason
                </label>
                <textarea
                  placeholder="Enter reason for suspension..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full p-2 rounded border border-input text-sm"
                  rows={3}
                />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSuspendUser}
                disabled={suspending || !suspendReason.trim()}
              >
                <Ban className="w-4 h-4 mr-2" />
                {suspending ? 'Processing...' : 'Suspend User'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
