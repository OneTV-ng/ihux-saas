"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createUser } from "@/utils/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Switch } from "@/components/ui/switch";
import { RoleSelect } from "./role-select";
import { authClient } from "@/lib/auth-client";

interface UserAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserAddDialog({ isOpen, onClose, onSuccess }: UserAddDialogProps) {
  const { data: session } = authClient.useSession();
  const adminRole = session?.user?.role || "admin";
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "member" as string,
    autoVerify: false,
  });

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      await createUser({
        ...formData,
        role: formData.role as "user" | "admin",
      });
      toast.success(
        formData.autoVerify
          ? "User created and verified successfully"
          : "User created successfully. Verification email sent.",
      );
      onSuccess?.();
      onClose();
      setFormData({ name: "", firstName: "", lastName: "", username: "", email: "", password: "", role: "member", autoVerify: false });
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
      onConfirm={handleCreateUser}
      title="Add New User"
      description="Create a new user account with the following details."
      confirmText={isLoading ? "Creating..." : "Create User"}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="Enter user's first name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Enter user's last name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Enter username"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter user's full name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Enter user's email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Enter user's password"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <RoleSelect
            value={formData.role}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v }))}
            assignerRole={adminRole}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="autoVerify" className="cursor-pointer">
            Auto-verify email
          </Label>
          <Switch
            id="autoVerify"
            checked={formData.autoVerify}
            onCheckedChange={(checked: boolean) =>
              setFormData((prev) => ({ ...prev, autoVerify: checked }))
            }
          />
        </div>
      </div>
    </ConfirmationDialog>
  );
}
