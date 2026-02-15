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
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In real implementation, fetch user data based on params.id
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Artist',
    status: 'active',
    location: 'Los Angeles, CA',
    joinDate: '2023-05-15',
    verificationStatus: 'verified',
    bannedReason: null,
  };

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
                <p className="text-2xl font-bold">{user.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
              <Badge
                variant={user.status === 'active' ? 'default' : 'destructive'}
              >
                {user.status}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{user.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Verified</span>
              <Badge
                variant={
                  user.verificationStatus === 'verified' ? 'default' : 'secondary'
                }
              >
                {user.verificationStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Joined on {user.joinDate}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <CheckCircle className="w-4 h-4" />
              View Verification Documents
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Mail className="w-4 h-4" />
              Send Message
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start gap-2"
            >
              <Ban className="w-4 h-4" />
              Suspend User
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
