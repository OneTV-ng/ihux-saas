"use client";

import { format } from "date-fns";
import { CheckCircle, XCircle, Mail, ShieldCheck, Clock, FileSearch, Flag, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserWithDetails } from "@/utils/users";
import { GithubIcon, GoogleIcon } from "../ui/icons";
import { UserActions } from "./user-actions";
import { RoleBadge } from "./role-badge";

interface UserCardProps {
  user: UserWithDetails;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  onActionComplete?: () => void;
}

const getAccountIcon = (account: string) => {
  switch (account) {
    case "credential":
      return <Mail className="h-4 w-4" />;
    case "github":
      return <GithubIcon className="h-4 w-4" />;
    case "google":
      return <GoogleIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

function getVerificationIcon(status: string | null) {
  switch (status) {
    case "verified":
      return <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />;
    case "submitted":
      return <FileSearch className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    case "processing":
      return <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    case "flagged":
      return <Flag className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
    case "rejected":
      return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
    case "suspended":
      return <Pause className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    case "updating":
      return <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />;
    default:
      return <XCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />;
  }
}

export function UserCard({ user, selected, onSelect, onClick, onActionComplete }: UserCardProps) {
  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => { e.stopPropagation(); onSelect(); }}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-gray-300 mt-1 shrink-0"
              />
            )}
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-sm truncate">{user.name}</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {user.emailVerified ? (
                      <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>{user.emailVerified ? "Email verified" : "Email not verified"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{getVerificationIcon(user.verificationStatus)}</span>
                  </TooltipTrigger>
                  <TooltipContent>Identity: {user.verificationStatus || "Not started"}</TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                <RoleBadge role={user.role} />
                <Badge
                  variant={user.banned ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {user.banned ? "Banned" : "Active"}
                </Badge>
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <UserActions user={user} onActionComplete={onActionComplete || (() => {})} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Accounts</p>
            <div className="flex gap-1 mt-1">
              {user.accounts.map((type) => (
                <div
                  key={type}
                  className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"
                >
                  {getAccountIcon(type)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium mt-1">
              {format(new Date(user.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
