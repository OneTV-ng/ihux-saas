"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "./role-badge";
import { RoleSelect } from "./role-select";
import {
  getUserDetail,
  updateUserDirect,
  updateUserVerification,
} from "@/utils/auth";
import {
  Ban,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  Flag,
  Pause,
  FileSearch,
} from "lucide-react";

interface UserDetailSheetProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
  adminRole: string;
}

export function UserDetailSheet({
  userId,
  open,
  onOpenChange,
  onActionComplete,
  adminRole,
}: UserDetailSheetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [verificationAction, setVerificationAction] = useState("");
  const [verificationRemark, setVerificationRemark] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await getUserDetail(userId);
      setData(result);
      setEditForm({
        name: result.user.name || "",
        email: result.user.email || "",
        username: result.user.username || "",
        phone: result.user.phone || "",
        whatsapp: result.user.whatsapp || "",
        address: result.user.address || "",
        recordLabel: result.user.recordLabel || "",
        role: result.user.role || "new",
        apiClass: result.user.apiClass || "5",
        emailVerified: result.user.emailVerified ?? false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) fetchUser();
  }, [open, userId, fetchUser]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateUserDirect(userId, editForm);
      toast.success("User updated successfully");
      await fetchUser();
      onActionComplete();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleVerificationAction = async (status: string) => {
    if (!userId) return;
    try {
      await updateUserVerification(userId, {
        status,
        remark: verificationRemark || undefined,
        rejectionReason: status === "rejected" ? verificationRemark || "Rejected by admin" : undefined,
        flagReason: status === "flagged" ? verificationRemark || "Flagged by admin" : undefined,
      });
      toast.success(`Verification ${status}`);
      setVerificationRemark("");
      setVerificationAction("");
      await fetchUser();
      onActionComplete();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update verification");
    }
  };

  const user = data?.user;
  const verification = data?.verification;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {loading ? <Skeleton className="h-6 w-40" /> : (user?.name || "User Details")}
          </SheetTitle>
          <SheetDescription>
            {loading ? <Skeleton className="h-4 w-60" /> : user?.email}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : user ? (
          <Tabs defaultValue="overview" className="mt-4 px-1">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="edit" className="flex-1">Edit</TabsTrigger>
              <TabsTrigger value="verification" className="flex-1">Verification</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image || user.profilePicture} />
                  <AvatarFallback className="text-lg">
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.username && (
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <RoleBadge role={user.role} />
                {user.banned ? (
                  <Badge variant="destructive" className="gap-1">
                    <Ban className="h-3 w-3" /> Banned
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                  {user.emailVerified ? (
                    <div className="flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-300">
                      <Mail className="h-4 w-4" /> Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-400">
                      <XCircle className="h-4 w-4" /> Pending
                    </div>
                  )}
                </div>
                <div className="rounded-md border p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Identity</p>
                  <IdentityStatusDisplay status={verification?.status || null} />
                </div>
              </div>

              {user.banned && user.banReason && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <strong>Ban reason:</strong> {user.banReason}
                  {user.banExpires && (
                    <span className="block mt-1">
                      Expires: {new Date(user.banExpires).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>API Class: {user.apiClass || "None"}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.address}</span>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Accounts: {data.accounts?.length ? data.accounts.join(", ") : "None"}</p>
                <p>Active sessions: {data.sessionCount ?? 0}</p>
              </div>
            </TabsContent>

            {/* EDIT TAB */}
            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editForm.username}
                    onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, username: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                    <Input
                      id="edit-whatsapp"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, whatsapp: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={editForm.address}
                    onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-recordLabel">Record Label</Label>
                  <Input
                    id="edit-recordLabel"
                    value={editForm.recordLabel}
                    onChange={(e) => setEditForm((p: Record<string, any>) => ({ ...p, recordLabel: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Role</Label>
                  <RoleSelect
                    value={editForm.role}
                    onValueChange={(v) => setEditForm((p: Record<string, any>) => ({ ...p, role: v }))}
                    assignerRole={adminRole}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>API Class</Label>
                  <Select
                    value={editForm.apiClass}
                    onValueChange={(v) => setEditForm((p: Record<string, any>) => ({ ...p, apiClass: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Class 5 - Basic</SelectItem>
                      <SelectItem value="10">Class 10 - Standard</SelectItem>
                      <SelectItem value="20">Class 20 - Premium</SelectItem>
                      <SelectItem value="50">Class 50 - Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-verified">Email Verified</Label>
                  <Switch
                    id="edit-verified"
                    checked={editForm.emailVerified}
                    onCheckedChange={(v) => setEditForm((p: Record<string, any>) => ({ ...p, emailVerified: v }))}
                  />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </TabsContent>

            {/* VERIFICATION TAB */}
            <TabsContent value="verification" className="space-y-4 mt-4">
              {verification ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <VerificationStatusBadge status={verification.status} />
                    </div>
                    {verification.completionPercentage && (
                      <div className="text-sm text-muted-foreground">
                        Completion: {verification.completionPercentage}%
                      </div>
                    )}
                    {verification.submittedAt && (
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                    {verification.verifiedAt && (
                      <div className="text-sm text-muted-foreground">
                        Verified: {new Date(verification.verifiedAt).toLocaleDateString()}
                      </div>
                    )}
                    {verification.remark && (
                      <div className="text-sm p-2 rounded bg-muted">
                        <strong>Remark:</strong> {verification.remark}
                      </div>
                    )}
                    {verification.rejectionReason && (
                      <div className="text-sm p-2 rounded bg-destructive/10 text-destructive">
                        <strong>Rejection:</strong> {verification.rejectionReason}
                      </div>
                    )}
                    {verification.flagReason && (
                      <div className="text-sm p-2 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <strong>Flag:</strong> {verification.flagReason}
                      </div>
                    )}
                  </div>

                  {(verification.governmentIdUrl || verification.signatureUrl) && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documents</p>
                      <div className="grid grid-cols-2 gap-3">
                        {verification.governmentIdUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: verification.governmentIdUrl!, title: "Government ID" })}
                            className="group relative rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 overflow-hidden transition-colors aspect-[4/3] bg-muted"
                          >
                            <img
                              src={verification.governmentIdUrl}
                              alt="Government ID"
                              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-2">
                              <span className="text-white text-xs font-medium">Government ID</span>
                            </div>
                          </button>
                        )}
                        {verification.signatureUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: verification.signatureUrl!, title: "Signature" })}
                            className="group relative rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 overflow-hidden transition-colors aspect-[4/3] bg-muted"
                          >
                            <img
                              src={verification.signatureUrl}
                              alt="Signature"
                              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-2">
                              <span className="text-white text-xs font-medium">Signature</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <Label>Admin Action</Label>
                    <Textarea
                      placeholder="Add remark or reason..."
                      value={verificationRemark}
                      onChange={(e) => setVerificationRemark(e.target.value)}
                      rows={2}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerificationAction("verified")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerificationAction("rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerificationAction("flagged")}
                        className="text-yellow-600 border-yellow-300"
                      >
                        <Flag className="h-4 w-4 mr-1" /> Flag
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerificationAction("suspended")}
                      >
                        <Pause className="h-4 w-4 mr-1" /> Suspend
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No verification record found for this user.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            User not found.
          </div>
        )}
      </SheetContent>

      {/* Document Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 overflow-auto max-h-[calc(90vh-80px)]">
            {previewImage && (
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-auto rounded-md object-contain"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 p-4 pt-0">
            {previewImage && (
              <a
                href={previewImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border hover:bg-muted transition-colors"
              >
                Open in new tab
              </a>
            )}
            <Button variant="outline" size="sm" onClick={() => setPreviewImage(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

function VerificationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    updating: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    flagged: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    suspended: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles.updating}`}>
      {status}
    </span>
  );
}

function IdentityStatusDisplay({ status }: { status: string | null }) {
  if (!status) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <XCircle className="h-4 w-4" /> Not started
      </div>
    );
  }

  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    updating: {
      icon: <Clock className="h-4 w-4" />,
      label: "Updating",
      className: "text-gray-600 dark:text-gray-300",
    },
    submitted: {
      icon: <FileSearch className="h-4 w-4" />,
      label: "Submitted",
      className: "text-blue-700 dark:text-blue-300",
    },
    processing: {
      icon: <Clock className="h-4 w-4" />,
      label: "Processing",
      className: "text-amber-700 dark:text-amber-300",
    },
    verified: {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: "Verified",
      className: "text-green-700 dark:text-green-300",
    },
    rejected: {
      icon: <XCircle className="h-4 w-4" />,
      label: "Rejected",
      className: "text-red-700 dark:text-red-300",
    },
    flagged: {
      icon: <Flag className="h-4 w-4" />,
      label: "Flagged",
      className: "text-orange-700 dark:text-orange-300",
    },
    suspended: {
      icon: <Pause className="h-4 w-4" />,
      label: "Suspended",
      className: "text-purple-700 dark:text-purple-300",
    },
  };

  const c = config[status] || config.updating;

  return (
    <div className={`flex items-center gap-1.5 text-sm ${c.className}`}>
      {c.icon} {c.label}
    </div>
  );
}
