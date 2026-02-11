"use client";
import {
  CheckCircle,
  XCircle,
  Mail,
  Ban,
  Check,
  Search,
  Users,
  UserPlus,
  ShieldCheck,
  Clock,
  FileSearch,
  Flag,
  Pause,
} from "lucide-react";
import { format } from "date-fns";
import useSWR from "swr";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserWithDetails } from "@/utils/users";
import { GithubIcon, GoogleIcon } from "../ui/icons";
import { UserActions } from "./user-actions";
import { UserCard } from "./user-card";
import { RoleBadge } from "./role-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { UserAddDialog } from "./user-add-dialog";
import { ROLE_HIERARCHY } from "@/lib/role-utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getAccountIcon = (account: string) => {
  switch (account) {
    case "credential":
      return <Mail className="h-4 w-4 dark:text-neutral-300" />;
    case "github":
      return <GithubIcon className="h-4 w-4 dark:text-neutral-300" />;
    case "google":
      return <GoogleIcon className="h-4 w-4 dark:text-neutral-300" />;
    default:
      return null;
  }
};

interface UsersTableProps {
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onUserClick: (userId: string) => void;
  onActionComplete?: () => void;
}

export function UsersTable({
  selectedIds,
  onSelectionChange,
  onUserClick,
  onActionComplete: externalActionComplete,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (role && role !== "all") params.set("role", role);
    if (status && status !== "all") params.set("status", status);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (page) params.set("page", String(page));
    params.set("limit", String(limit));
    router.replace(`?${params.toString()}`);
  }, [role, status, debouncedSearch, page, router]);

  const swrKey = useMemo(() => {
    const params = new URLSearchParams();
    if (role && role !== "all") params.set("role", role);
    if (status && status !== "all") params.set("status", status);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    params.set("page", String(page));
    params.set("limit", String(limit));
    return `/api/admin/users?${params.toString()}`;
  }, [role, status, debouncedSearch, page, limit]);

  const { data, error, mutate, isLoading } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const handleActionComplete = () => {
    mutate();
    externalActionComplete?.();
  };

  const users: UserWithDetails[] = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const allPageIds = users.map((u) => u.id);
  const allSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
  const someSelected = allPageIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      allPageIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      allPageIds.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const filterControls = (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-end mb-2 w-full">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-end flex-1">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email..."
            className="pl-8 pr-2 py-2 border rounded-md text-sm bg-background w-full sm:w-[220px]"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[150px] flex items-center gap-2">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLE_HIERARCHY.map((r) => (
              <SelectItem key={r} value={r}>
                <span className="capitalize">{r}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[130px]">
            <span>{status === "all" ? "All Status" : status === "banned" ? "Banned" : "Active"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <button
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-xs hover:bg-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Add User
      </button>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    if (endPage - startPage < maxPagesToShow - 1) {
      if (startPage === 1) endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      else if (endPage === totalPages) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : 0}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          {pageNumbers.map((pNum) => (
            <PaginationItem key={pNum}>
              <PaginationLink isActive={pNum === page} onClick={() => setPage(pNum)}>
                {pNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => setPage(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-disabled={page === totalPages}
              tabIndex={page === totalPages ? -1 : 0}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (error) return <div>Failed to load users</div>;

  const columns = [
    { label: "", className: "w-[40px]" }, // checkbox
    { label: "Name" },
    { label: "Email" },
    { label: "Identity" },
    { label: "Accounts" },
    { label: "Role" },
    { label: "Status" },
    { label: "Last Sign In" },
    { label: "Created" },
    { label: "Actions", className: "w-[80px]" },
  ];

  const skeletonRows = (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell className="px-2 py-3"><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell className="px-4 py-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[160px]" />
              </div>
            </div>
          </TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-6 w-[70px]" /></TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-6 w-[80px]" /></TableCell>
          <TableCell className="px-4 py-3">
            <div className="flex -space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-6 w-[60px]" /></TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-6 w-[60px]" /></TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell className="px-4 py-3"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      {filterControls}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
          ))
        ) : (
          users.map((user: UserWithDetails) => (
            <UserCard
              key={user.id}
              user={user}
              selected={selectedIds.has(user.id)}
              onSelect={() => toggleSelect(user.id)}
              onClick={() => onUserClick(user.id)}
              onActionComplete={handleActionComplete}
            />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border-muted border-2">
        <Table className="text-sm">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead
                  key={col.label || `col-${i}`}
                  className={`${col.className || ""} px-4 py-3 text-xs font-medium text-muted-foreground`.trim()}
                >
                  {i === 0 ? (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !data
              ? skeletonRows
              : users.map((user: UserWithDetails) => (
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedIds.has(user.id) ? "bg-primary/5" : ""}`}
                    onClick={() => onUserClick(user.id)}
                  >
                    <TableCell className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {user.emailVerified ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 flex items-center gap-1 px-2 py-1 text-xs">
                          <Mail className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 flex items-center gap-1 px-2 py-1 text-xs">
                          <XCircle className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <VerificationStatusBadge status={user.verificationStatus} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {user.accounts.map((account) => (
                          <div
                            key={account}
                            className="rounded-full bg-muted p-1.5 text-muted-foreground dark:bg-neutral-700"
                            title={account}
                          >
                            {getAccountIcon(account)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {user.banned ? (
                        <div className="flex flex-col gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="flex items-center gap-1 px-2 py-1 text-xs cursor-help">
                                <Ban className="h-3 w-3" /> Banned
                              </Badge>
                            </TooltipTrigger>
                            {user.banReason && <TooltipContent>Reason: {user.banReason}</TooltipContent>}
                          </Tooltip>
                          {user.banExpires && (
                            <span className="text-xs text-muted-foreground">
                              Expires: {format(user.banExpires, "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700 flex items-center gap-1 px-2 py-1 text-xs">
                          <Check className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {user.lastSignIn ? format(user.lastSignIn, "MMM d, yyyy") : "Never"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {format(user.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <UserActions user={user} onActionComplete={handleActionComplete} />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-1">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size > 0
            ? `${selectedIds.size} selected of ${total} users`
            : `Showing ${users.length} of ${total} users`}
        </div>
        {renderPagination()}
      </div>

      <UserAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}

function VerificationStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 flex items-center gap-1 px-2 py-1 text-xs">
        <XCircle className="h-3 w-3" /> None
      </Badge>
    );
  }

  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    updating: {
      icon: <Clock className="h-3 w-3" />,
      label: "Updating",
      className: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    },
    submitted: {
      icon: <FileSearch className="h-3 w-3" />,
      label: "Submitted",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
    },
    processing: {
      icon: <Clock className="h-3 w-3" />,
      label: "Processing",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700",
    },
    verified: {
      icon: <ShieldCheck className="h-3 w-3" />,
      label: "Verified",
      className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
    },
    rejected: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Rejected",
      className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
    },
    flagged: {
      icon: <Flag className="h-3 w-3" />,
      label: "Flagged",
      className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
    },
    suspended: {
      icon: <Pause className="h-3 w-3" />,
      label: "Suspended",
      className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
    },
  };

  const c = config[status] || config.updating;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 px-2 py-1 text-xs ${c.className}`}>
      {c.icon} {c.label}
    </Badge>
  );
}
