'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, AlertCircle, Loader, Filter } from 'lucide-react';
import Link from 'next/link';
import { mobileApi } from '@/lib/mobile-api-client';

interface PublishingRecord {
  id: string;
  songId: string;
  productCode: string;
  publishedBy: string;
  status: string;
  createdAt?: string;
  song?: {
    title: string;
    artistName: string;
  };
}

export default function PublishingPage() {
  const [records, setRecords] = useState<PublishingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    loadPublishingRecords();
  }, [page, filter]);

  const loadPublishingRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const status = filter === 'all' ? undefined : filter;
      const response = await mobileApi.admin.getPublishingRecords(page, 20, status);

      if (response.success) {
        const data = response.data as any;
        setRecords(data?.records || []);
        setPagination(data?.pagination || { total: 0, totalPages: 0 });
      } else {
        setError(response.error || 'Failed to load publishing records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load publishing records');
      console.error('Publishing load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <h1 className="text-2xl font-bold text-primary mb-2">Publishing Management</h1>
        <p className="text-xs text-muted-foreground mb-4">View and manage published songs</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'processing', 'approved', 'published'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className="text-xs whitespace-nowrap"
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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
                  onClick={loadPublishingRecords}
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

      {/* Publishing Records List */}
      {!loading && !error && (
        <div className="p-4 space-y-3">
          {records.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No publishing records found</p>
              </CardContent>
            </Card>
          ) : (
            records.map((record) => (
              <Card
                key={record.id}
                className="cursor-pointer hover:bg-accent transition"
              >
                <Link href={`/m/admin/publishing/${record.songId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">
                            {record.song?.title || 'Unknown Song'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {record.song?.artistName || 'Unknown Artist'}
                        </p>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-mono">
                            {record.productCode}
                          </Badge>
                          <Badge
                            className={`text-xs ${getStatusColor(record.status)}`}
                            variant="secondary"
                          >
                            {record.status}
                          </Badge>
                          {record.createdAt && (
                            <Badge variant="outline" className="text-xs">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}

          {/* Pagination */}
          {records.length > 0 && pagination.totalPages > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page >= pagination.totalPages}
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
