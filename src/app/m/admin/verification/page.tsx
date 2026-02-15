import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminVerification() {
  const verifications = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john@example.com',
      type: 'Artist',
      status: 'pending',
      date: '2024-02-10',
      priority: 'high',
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane@example.com',
      type: 'Label',
      status: 'pending',
      date: '2024-02-09',
      priority: 'normal',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      email: 'mike@example.com',
      type: 'Artist',
      status: 'flagged',
      date: '2024-02-08',
      priority: 'high',
    },
    {
      id: 4,
      user: 'Sarah Williams',
      email: 'sarah@example.com',
      type: 'Artist',
      status: 'verified',
      date: '2024-02-07',
      priority: 'normal',
    },
  ];

  const statusConfig = {
    pending: { color: 'secondary', icon: Clock },
    flagged: { color: 'destructive', icon: AlertCircle },
    verified: { color: 'default', icon: CheckCircle },
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Verification</h1>
        <p className="text-xs text-muted-foreground">
          Review and manage user verifications
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {['All', 'Pending', 'Flagged', 'Verified'].map((filter) => (
            <Button
              key={filter}
              variant={filter === 'All' ? 'default' : 'outline'}
              size="sm"
              className="text-xs whitespace-nowrap"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Verification List */}
      <div className="p-4 space-y-3">
        {verifications.map((verification) => {
          const config =
            statusConfig[verification.status as keyof typeof statusConfig];
          const StatusIcon = config?.icon || Clock;

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
                        <p className="font-semibold text-sm">{verification.user}</p>
                        {verification.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {verification.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {verification.type}
                        </Badge>
                        <Badge variant={config?.color} className="text-xs">
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
        })}
      </div>
    </div>
  );
}
