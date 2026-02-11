import { authClient } from "@/lib/auth-client";

export async function banUser(
  userId: string,
  banReason: string,
  banExpiresIn?: number,
) {
  const res = await authClient.admin.banUser({
    userId,
    banReason,
    banExpiresIn,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to ban user");
  }

  return res;
}

export async function unbanUser(userId: string) {
  const res = await authClient.admin.unbanUser({
    userId,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to unban user");
  }

  return res;
}

export async function deleteUser(userId: string) {
  const res = await authClient.admin.removeUser({
    userId,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to delete user");
  }

  return res;
}

export async function revokeUserSessions(userId: string) {
  const res = await authClient.admin.revokeUserSessions({
    userId,
  });

  if (res?.error) {
    throw new Error(res.error.message || "Failed to revoke user sessions");
  }

  return res;
}

export async function createUser(data: {
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  password: string;
  role?: "user" | "admin" | ("user" | "admin")[];
  data?: Record<string, any>;
  autoVerify?: boolean;
}) {
  const { autoVerify, ...userData } = data;

  // If autoVerify is true, add emailVerified to data
  const createData = {
    ...userData,
    data: {
      ...userData.data,
      ...(autoVerify ? { emailVerified: true } : {}),
    },
  };

  // Add firstName, lastName, username if present
  if (data.firstName) createData.firstName = data.firstName;
  if (data.lastName) createData.lastName = data.lastName;
  if (data.username) createData.username = data.username;

  const res = await authClient.admin.createUser(createData);

  if (res?.error) {
    throw new Error(res.error.message || "Failed to create user");
  }

  // If not auto-verified, send verification email
  if (!autoVerify) {
    try {
      await authClient.sendVerificationEmail({
        email: data.email,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't throw here as user was created successfully
    }
  }

  return res;
}

export async function updateUserRole(userId: string, role: string) {
  // Use direct API route for full 14-role system (Better Auth only supports user/admin)
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update user role");
  }
  return res.json();
}

export async function updateUserDirect(
  userId: string,
  data: Record<string, unknown>
) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to update user");
  }
  return res.json();
}

export async function getUserDetail(userId: string) {
  const res = await fetch(`/api/admin/users/${userId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to fetch user");
  }
  return res.json();
}

export async function bulkUserAction(
  action: string,
  userIds: string[],
  params?: Record<string, unknown>
) {
  const res = await fetch("/api/admin/users/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, userIds, ...params }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Bulk operation failed");
  }
  return res.json();
}

export async function updateUserVerification(
  userId: string,
  data: { status: string; remark?: string; rejectionReason?: string; flagReason?: string }
) {
  const res = await fetch(`/api/admin/users/${userId}/verification`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to update verification");
  }
  return res.json();
}
