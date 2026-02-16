import { UsersManagementClient } from "@/components/admin/users-management-client";
import { Suspense } from "react";

export default function UserManagementMock() {
  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <Suspense fallback={<div>Loading users...</div>}>
        <UsersManagementClient />
      </Suspense>
    </section>
  );
}
