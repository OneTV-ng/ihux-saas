"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_TENANT || process.env.TENANT || "mstudios";
import { ROLES, ROLE_PERMISSIONS, UserRole ,User } from "@/db/schema/user.schema";
import { DxlApiClient, initDxlApiClient, getDxlApiClient } from "@/lib/dxl-api-client";

export interface Uxxser {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  profilePicture?: string | null;
  headerBackground?: string | null;
  role?: string;
  apiClass?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  recordLabel?: string | null;
  socialMedia?: any;
  bankDetails?: any;
  settings?: any;
  createdAt?: Date;
  updatedAt?: Date;
  isUserVerified?: boolean;
  isEmailVerified?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  userId: string;
  isDefault?: boolean;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  defaultArtist: Artist | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  userPermissions: typeof ROLE_PERMISSIONS[UserRole] | null;
  hasRole: (role: UserRole) => boolean;
  hasMinRole: (minRole: UserRole) => boolean;
  canPerformAction: (action: string) => boolean;
  getUser: () => User | null;
  setUser: (user: User | null) => void;
  getSession: () => Session | null;
  setDefaultArtist: (artist: Artist | null) => void;
  getDefaultArtist: () => Artist | null;
  refreshUser: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  signOut: () => Promise<void>;
  apiClient: DxlApiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [defaultArtist, setDefaultArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiClient] = useState(() => initDxlApiClient({ baseUrl: "/api/dxl/v3" }));

  const isAuthenticated = !!user && !!session;

  // Centralized refresh: listen for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('better-auth')) {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Refresh auth state on route change (client-side navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      refreshUser();
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pushstate', handleRouteChange);
    window.addEventListener('replacestate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pushstate', handleRouteChange);
      window.removeEventListener('replacestate', handleRouteChange);
    };
  }, []);

  // Centralized force refresh method
  const forceRefresh = async () => {
    await refreshUser();
  };
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SADMIN;
  const userRole = (user?.role as UserRole) || null;
  const userPermissions = userRole ? ROLE_PERMISSIONS[userRole] : null;

  // Role checking functions
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasMinRole = (minRole: UserRole): boolean => {
    if (!user?.role || !userPermissions) return false;

    const minPermissions = ROLE_PERMISSIONS[minRole];
    if (!minPermissions) return false;

    return userPermissions.powerLevel >= minPermissions.powerLevel;
  };

  const canPerformAction = (action: string): boolean => {
    if (!userPermissions) return false;
    return !!(userPermissions as any)[action];
  };

  // Fetch session on mount and hydration (force refresh)
  useEffect(() => {
    // Always force refresh on hydration to sync with server session
    // Initialize with loading state true to ensure proper hydration
    setIsLoading(true);
    refreshUser();
  }, []);

  // Update API client token whenever session changes
  useEffect(() => {
    if (session?.session?.token) {
      apiClient.setToken(session.session.token);
    } else {
      apiClient.setToken("");
    }
  }, [session, apiClient]);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      // Use Better Auth default session endpoint
      const { data, error } = await authClient.getSession();
      // No custom endpoint, just rely on authClient.getSession()
      if (error || !data) {
        setUser(null);
        setSession(null);
        setDefaultArtist(null);
        return;
      }
      setSession(data as Session);
      const user = data.user as unknown as User;
      setUser({
        ...user,
        isUserVerified:
          typeof user.isVerified === "boolean"
            ? user?.isVerified 
            : !!(user.isVerified || user.isVerified),
        emailVerified:
          typeof user.emailVerified === "boolean"
            ? user.emailVerified
            : !!(user.emailVerified || user.emailVerified),
        tenant:
          user.tenant || DEFAULT_TENANT,
      });
      if (user) {
        await fetchDefaultArtist(user.id);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
      setSession(null);
      setDefaultArtist(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultArtist = async (userId: string) => {
    try {
      const response = await fetch(`/api/artist/default?userId=${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDefaultArtist(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch default artist:", error);
    }
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setSession(null);
      setDefaultArtist(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const getUser = () => user;
  const getSession = () => session;
  const getDefaultArtist = () => defaultArtist;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        defaultArtist,
        isLoading,
        isAuthenticated,
        isAdmin,
        userRole,
        userPermissions,
        hasRole,
        hasMinRole,
        canPerformAction,
        getUser,
        setUser,
        getSession,
        setDefaultArtist,
        getDefaultArtist,
        refreshUser,
        forceRefresh,
        signOut,
        apiClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
