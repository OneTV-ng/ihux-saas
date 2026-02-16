/**
 * Hook to verify artist status and redirect if not verified
 * If user role is "new" (not verified), redirects to profile#verification
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function useArtistVerificationGuard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If user is not authenticated, let the auth check handle it
    if (!user) return;

    // If user role is "new" (not verified), redirect to verification
    if (user.role === 'new') {
      router.replace('/desk/profile#verification');
    }
  }, [user, isLoading, router]);

  // Return loading state so component can show loading state if needed
  return {
    isVerified: user?.role !== 'new' && user?.role !== undefined,
    isLoading,
  };
}
