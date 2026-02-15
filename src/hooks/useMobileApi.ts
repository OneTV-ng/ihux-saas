/**
 * React Hook for using Mobile API Client
 * Provides easy access to API methods with loading and error states
 */

import { useState, useCallback, useEffect } from 'react';
import { mobileApi, ApiResponse } from '@/lib/mobile-api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic API hook for any API call
 */
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  immediate: boolean = true
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await apiCall();
      if (result.success) {
        setState({ data: result.data || null, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: result.error || 'Unknown error' });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, refetch: execute };
}

/**
 * Hook for async mutations (POST, PATCH, DELETE)
 */
export function useMutation<T, Vars = any>(
  apiCall: (variables: Vars) => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T> & { isExecuting: boolean }>({
    data: null,
    loading: false,
    error: null,
    isExecuting: false,
  });

  const execute = useCallback(
    async (variables: Vars) => {
      setState((prev) => ({ ...prev, loading: true, error: null, isExecuting: true }));
      try {
        const result = await apiCall(variables);
        if (result.success) {
          setState((prev) => ({
            ...prev,
            data: result.data || null,
            loading: false,
            error: null,
            isExecuting: false,
          }));
          return result.data;
        } else {
          setState((prev) => ({
            ...prev,
            data: null,
            loading: false,
            error: result.error || 'Unknown error',
            isExecuting: false,
          }));
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          data: null,
          loading: false,
          error: errorMsg,
          isExecuting: false,
        }));
        throw error;
      }
    },
    [apiCall]
  );

  return { ...state, execute };
}

/**
 * Hook for authentication
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await mobileApi.auth.getSession();
        setIsAuthenticated(session.success);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useMutation((vars: { email: string; password: string }) =>
    mobileApi.auth.signIn(vars.email, vars.password)
  );

  const signUp = useMutation((vars: { email: string; password: string; name: string }) =>
    mobileApi.auth.signUp(vars.email, vars.password, vars.name)
  );

  const signOut = useCallback(async () => {
    await mobileApi.auth.signOut();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

/**
 * Hook for user profile
 */
export function useProfile() {
  const profile = useApi(() => mobileApi.profile.getProfile(), true);

  const updateProfile = useMutation((data) => mobileApi.profile.updateProfile(data));

  const submitVerification = useMutation((data) =>
    mobileApi.profile.submitVerification(data)
  );

  return {
    profile: profile.data,
    loading: profile.loading,
    error: profile.error,
    refetch: profile.refetch,
    updateProfile,
    submitVerification,
  };
}

/**
 * Hook for artists
 */
export function useArtists() {
  const artists = useApi(() => mobileApi.artists.getMyArtists(), true);

  const createArtist = useMutation((data) => mobileApi.artists.createArtist(data));

  const updateArtist = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      mobileApi.artists.updateArtist(id, data)
  );

  const deleteArtist = useMutation((id: string) => mobileApi.artists.deleteArtist(id));

  const setSelectedArtist = useMutation((id: string) =>
    mobileApi.artists.setSelectedArtist(id)
  );

  return {
    artists: artists.data,
    loading: artists.loading,
    error: artists.error,
    refetch: artists.refetch,
    createArtist,
    updateArtist,
    deleteArtist,
    setSelectedArtist,
  };
}

/**
 * Hook for songs
 */
export function useSongs(search?: string, page: number = 1, pageSize: number = 10) {
  const songs = useApi(
    () => mobileApi.songs.getUserSongs(search, page, pageSize),
    true
  );

  const createSong = useMutation((data) => mobileApi.songs.createSong(data));

  const updateSong = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      mobileApi.songs.updateSong(id, data)
  );

  const deleteSong = useMutation((id: string) => mobileApi.songs.deleteSong(id));

  const submitForReview = useMutation((id: string) =>
    mobileApi.songs.submitSongForReview(id)
  );

  return {
    songs: songs.data?.songs || [],
    total: songs.data?.total || 0,
    loading: songs.loading,
    error: songs.error,
    refetch: songs.refetch,
    createSong,
    updateSong,
    deleteSong,
    submitForReview,
  };
}

/**
 * Hook for uploads
 */
export function useUpload() {
  const [progress, setProgress] = useState(0);

  const uploadFile = useMutation(
    (vars: {
      file: Blob | File;
      fileType: 'audio' | 'cover' | 'document';
    }) =>
      mobileApi.uploads.uploadFile(
        vars.file,
        vars.fileType,
        setProgress
      )
  );

  return {
    uploadFile,
    progress,
    isUploading: uploadFile.loading,
  };
}

/**
 * Hook for admin operations
 */
export function useAdmin() {
  const getUsers = useMutation(
    ({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number }) =>
      mobileApi.admin.getUsers(page, pageSize)
  );

  const updateUser = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      mobileApi.admin.updateUser(id, data)
  );

  const suspendUser = useMutation(
    ({ id, reason }: { id: string; reason: string }) =>
      mobileApi.admin.suspendUser(id, reason)
  );

  const unsuspendUser = useMutation((id: string) =>
    mobileApi.admin.unsuspendUser(id)
  );

  return {
    getUsers,
    updateUser,
    suspendUser,
    unsuspendUser,
  };
}

export default {
  useApi,
  useMutation,
  useAuth,
  useProfile,
  useArtists,
  useSongs,
  useUpload,
  useAdmin,
};
