"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateUserRole } from "@/utils/auth";
import { Label } from "@/components/ui/label";
import { UserWithDetails } from "@/utils/users";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { RoleSelect } from "./role-select";
import { authClient } from "@/lib/auth-client";

interface UserRoleDialogProps {
  user: UserWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function UserRoleDialog({ user, isOpen, onClose }: UserRoleDialogProps) {
  const { data: session } = authClient.useSession();
  const adminRole = session?.user?.role || "admin";
  const [selectedRole, setSelectedRole] = useState(user.role || "new");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateRole = async () => {
    try {
      setIsLoading(true);
      await updateUserRole(user.id, selectedRole);
      toast.success(`User role updated to ${selectedRole}`);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleUpdateRole}
      title={`Update Role: ${user.name || user.email}`}
      description="Change the user's role in the system."
      confirmText={isLoading ? "Processing..." : "Update Role"}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Select Role</Label>
          <RoleSelect
            value={selectedRole}
            onValueChange={setSelectedRole}
            assignerRole={adminRole}
          />
        </div>
      </div>
    </ConfirmationDialog>
  );
}
