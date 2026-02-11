"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Ban, Trash2, Shield, X, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { RoleSelect } from "./role-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkUserAction } from "@/utils/auth";

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  onClear: () => void;
  onActionComplete: () => void;
  adminRole: string;
}

export function UserBulkActionsBar({
  selectedIds,
  onClear,
  onActionComplete,
  adminRole,
}: BulkActionsBarProps) {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("604800"); // 7 days in seconds
  const [bulkRole, setBulkRole] = useState("member");
  const [loading, setLoading] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const ids = Array.from(selectedIds);

  const handleBulkAction = async (
    action: string,
    params?: Record<string, unknown>,
    successMsg?: string
  ) => {
    setLoading(true);
    try {
      const result = await bulkUserAction(action, ids, params);
      if (result.success > 0) {
        toast.success(`${successMsg || action}: ${result.success} user(s) updated`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} user(s) failed`);
      }
      onClear();
      onActionComplete();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{count} user(s) selected</span>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRoleDialog(true)}
            disabled={loading}
          >
            <Shield className="h-4 w-4 mr-1" /> Set Role
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("verify", {}, "Verified")}
            disabled={loading}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBanDialog(true)}
            disabled={loading}
          >
            <Ban className="h-4 w-4 mr-1" /> Ban
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("unban", {}, "Unbanned")}
            disabled={loading}
          >
            Unban
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("revokeSessions", {}, "Sessions revoked")}
            disabled={loading}
          >
            <LogOut className="h-4 w-4 mr-1" /> Revoke Sessions
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Ban Dialog */}
      <ConfirmationDialog
        isOpen={showBanDialog}
        onClose={() => setShowBanDialog(false)}
        onConfirm={() =>
          handleBulkAction("ban", {
            banReason: banReason || "Banned by admin",
            banExpiresIn: banDuration === "permanent" ? undefined : Number(banDuration),
          }, "Banned")
        }
        title={`Ban ${count} User(s)`}
        description={`This will ban ${count} selected user(s).`}
        confirmText={loading ? "Processing..." : "Ban Users"}
        confirmVariant="destructive"
      >
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label>Ban Reason</Label>
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Duration</Label>
            <Select value={banDuration} onValueChange={setBanDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="86400">1 day</SelectItem>
                <SelectItem value="259200">3 days</SelectItem>
                <SelectItem value="604800">7 days</SelectItem>
                <SelectItem value="1209600">14 days</SelectItem>
                <SelectItem value="2592000">30 days</SelectItem>
                <SelectItem value="7776000">90 days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmationDialog>

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => handleBulkAction("delete", {}, "Deleted")}
        title={`Delete ${count} User(s)`}
        description={`This will permanently delete ${count} selected user(s). This action cannot be undone.`}
        confirmText={loading ? "Processing..." : "Delete Users"}
        confirmVariant="destructive"
      />

      {/* Role Dialog */}
      <ConfirmationDialog
        isOpen={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        onConfirm={() => handleBulkAction("setRole", { role: bulkRole }, "Role updated")}
        title={`Set Role for ${count} User(s)`}
        description="Select the role to assign to all selected users."
        confirmText={loading ? "Processing..." : "Set Role"}
      >
        <div className="py-2">
          <Label>Role</Label>
          <RoleSelect
            value={bulkRole}
            onValueChange={setBulkRole}
            assignerRole={adminRole}
          />
        </div>
      </ConfirmationDialog>
    </>
  );
}
