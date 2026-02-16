export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { UsersManagementClient } from "@/components/admin/users-management-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage users in the admin dashboard",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Suspense fallback={<div>Loading users...</div>}>
        <UsersManagementClient />
      </Suspense>
    </div>
  );
}
