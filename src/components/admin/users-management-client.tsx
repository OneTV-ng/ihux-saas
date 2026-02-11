"use client";

import { useState } from "react";
import { UsersTable } from "./users-table";
import { UserDetailSheet } from "./user-detail-sheet";
import { UserBulkActionsBar } from "./user-bulk-actions-bar";
import { authClient } from "@/lib/auth-client";

export function UsersManagementClient() {
  const { data: session } = authClient.useSession();
  const adminRole = session?.user?.role || "admin";

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActionComplete = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 px-2 sm:px-0 max-w-full sm:max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, permissions, and verification status.
        </p>
      </div>

      <UsersTable
        key={refreshKey}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onUserClick={(id) => setDetailUserId(id)}
        onActionComplete={handleActionComplete}
      />

      <UserDetailSheet
        userId={detailUserId}
        open={!!detailUserId}
        onOpenChange={(open) => { if (!open) setDetailUserId(null); }}
        onActionComplete={handleActionComplete}
        adminRole={adminRole}
      />

      <UserBulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds(new Set())}
        onActionComplete={handleActionComplete}
        adminRole={adminRole}
      />
    </div>
  );
}
