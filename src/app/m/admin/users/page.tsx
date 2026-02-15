import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ChevronRight,
  Ban,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminUsers() {
  // Mock data - replace with actual API call
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Artist',
      status: 'active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Label',
      status: 'active',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Artist',
      status: 'suspended',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      role: 'Admin',
      status: 'active',
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-4">User Management</h1>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="cursor-pointer hover:bg-accent transition">
            <CardContent className="p-4">
              <Link href={`/m/admin/users/${user.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
