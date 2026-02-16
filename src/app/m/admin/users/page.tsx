'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { mobileApi } from '@/lib/mobile-api-client';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  banned?: boolean;
  createdAt?: string;
}

export default function MobileAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getUsers(page, 20);

      if (response.success) {
        const data = response.data as User[] | { users: User[] };
        setUsers(Array.isArray(data) ? data : data?.users || []);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Users load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
          </div>
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
                  onClick={loadUsers}
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

      {/* Users List */}
      {!loading && !error && (
        <div className="p-4 space-y-3">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="cursor-pointer hover:bg-accent transition"
              >
                <CardContent className="p-4">
                  <Link href={`/m/admin/users/${user.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {user.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {user.role && (
                            <Badge variant="secondary" className="text-xs">
                              {user.role}
                            </Badge>
                          )}
                          <Badge
                            variant={user.banned ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {user.banned ? 'suspended' : 'active'}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={filteredUsers.length < 20}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
