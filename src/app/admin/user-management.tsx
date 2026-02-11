import { UsersManagementClient } from "@/components/admin/users-management-client";

export default function UserManagementMock() {
  return (
    <section className="flex flex-col h-full w-full py-6 px-4 md:px-8 space-y-6">
      <UsersManagementClient />
    </section>
  );
}
