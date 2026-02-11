import { UsersManagementClient } from "@/components/admin/users-management-client";
import { Suspense } from "react";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <UsersManagementClient />
    </Suspense>
  );
}
