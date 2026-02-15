/**
 * Mobile API Client - Universal API client for web and React Native
 * Provides type-safe access to all backend endpoints
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface SessionData {
  user: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
  token?: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  username?: string;
  phone?: string;
  whatsapp?: string;
  dateOfBirth?: string;
  address?: string;
  recordLabel?: string;
  role?: string;
  image?: string;
  socialMedia?: any;
  bankDetails?: any;
  settings?: any;
  createdAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  userId: string;
  bio?: string;
  image?: string;
  genres?: string[];
  location?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  genre?: string;
  cover?: string;
  type?: string;
  numberOfTracks?: number;
  isFeatured?: boolean;
  status?: 'draft' | 'pending' | 'published';
  createdAt?: string;
}

export interface UploadProgress {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed';
  mimeType?: string;
  size?: number;
}

export interface VerificationData {
  id: string;
  userId: string;
  status: 'updating' | 'submitted' | 'processing' | 'flagged' | 'rejected' | 'suspended' | 'verified';
  governmentIdUrl?: string;
  signatureUrl?: string;
  completionPercentage?: string;
  submittedAt?: string;
  processedAt?: string;
  verifiedAt?: string;
}

// ============================================================================
// MOBILE API CLIENT CLASS
// ============================================================================

export class MobileApiClient {
  private baseUrl: string;
  private sessionToken: string | null = null;
  private requestTimeout: number = 30000;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Set authentication token
   */
  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  /**
   * Get current session token
   */
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.requestTimeout,
      retries = this.retryAttempts,
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        };

        if (this.sessionToken) {
          requestHeaders['Authorization'] = `Bearer ${this.sessionToken}`;
        }

        const fetchOptions: RequestInit = {
          method,
          headers: requestHeaders,
          ...(body && { body: JSON.stringify(body) }),
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || `HTTP ${response.status}`,
            status: response.status,
          };
        }

        return {
          success: true,
          data,
          status: response.status,
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * (attempt + 1))
          );
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Network request failed',
      status: 0,
    };
  }

  // =========================================================================
  // AUTH HANDLERS
  // =========================================================================

  auth = {
    signIn: async (email: string, password: string) => {
      return this.request('/api/auth/signin', {
        method: 'POST',
        body: { email, password },
      });
    },

    signUp: async (email: string, password: string, name: string) => {
      return this.request('/api/auth/signup', {
        method: 'POST',
        body: { email, password, name },
      });
    },

    signOut: async () => {
      this.sessionToken = null;
      return this.request('/api/auth/signout', { method: 'POST' });
    },

    getSession: async (): Promise<ApiResponse<SessionData>> => {
      return this.request('/api/auth/session');
    },

    forgotPassword: async (email: string) => {
      return this.request('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
    },

    resetPassword: async (pin: string, password: string) => {
      return this.request('/api/auth/reset-password', {
        method: 'POST',
        body: { pin, password },
      });
    },
  };

  // =========================================================================
  // PROFILE HANDLERS
  // =========================================================================

  profile = {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
      return this.request('/api/profile');
    },

    updateProfile: async (data: Partial<UserProfile>) => {
      return this.request('/api/profile', {
        method: 'PATCH',
        body: data,
      });
    },

    submitVerification: async (data: {
      governmentIdUrl?: string;
      signatureUrl?: string;
      completionPercentage?: string;
    }) => {
      return this.request('/api/profile/submit-verification', {
        method: 'POST',
        body: data,
      });
    },

    getVerificationStatus: async (): Promise<ApiResponse<VerificationData>> => {
      return this.request('/api/profile/verification');
    },
  };

  // =========================================================================
  // ARTIST HANDLERS
  // =========================================================================

  artists = {
    getMyArtists: async (): Promise<ApiResponse<Artist[]>> => {
      return this.request('/api/artist');
    },

    getArtistById: async (id: string): Promise<ApiResponse<Artist>> => {
      return this.request(`/api/artist?id=${id}`);
    },

    getSelectedArtist: async (): Promise<ApiResponse<Artist>> => {
      return this.request('/api/artist?selected=true');
    },

    createArtist: async (data: Omit<Artist, 'id' | 'userId'>) => {
      return this.request('/api/artist', {
        method: 'POST',
        body: data,
      });
    },

    updateArtist: async (id: string, data: Partial<Artist>) => {
      return this.request(`/api/artist?id=${id}`, {
        method: 'PATCH',
        body: data,
      });
    },

    setSelectedArtist: async (id: string) => {
      return this.request(`/api/artist/select?id=${id}`, { method: 'POST' });
    },

    deleteArtist: async (id: string) => {
      return this.request(`/api/artist?id=${id}`, { method: 'DELETE' });
    },

    searchArtists: async (query: string, page: number = 1) => {
      return this.request(`/api/artists/search?q=${query}&page=${page}`);
    },

    getArtistBySlug: async (slug: string): Promise<ApiResponse<Artist>> => {
      return this.request(`/api/artists/${slug}`);
    },
  };

  // =========================================================================
  // SONG HANDLERS
  // =========================================================================

  songs = {
    getUserSongs: async (
      search?: string,
      page: number = 1,
      pageSize: number = 10
    ): Promise<ApiResponse<{ songs: Song[]; total: number }>> => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.append('search', search);
      return this.request(`/api/songs?${params.toString()}`);
    },

    createSong: async (data: Omit<Song, 'id' | 'createdAt'>) => {
      return this.request('/api/songs/create', {
        method: 'POST',
        body: data,
      });
    },

    getSongById: async (id: string): Promise<ApiResponse<Song>> => {
      return this.request(`/api/songs/${id}`);
    },

    updateSong: async (id: string, data: Partial<Song>) => {
      return this.request(`/api/songs/${id}`, {
        method: 'PATCH',
        body: data,
      });
    },

    deleteSong: async (id: string) => {
      return this.request(`/api/songs/${id}`, { method: 'DELETE' });
    },

    submitSongForReview: async (id: string, data?: any) => {
      return this.request(`/api/songs/${id}/submit`, {
        method: 'POST',
        body: data,
      });
    },

    getSongTracks: async (id: string) => {
      return this.request(`/api/songs/${id}/tracks`);
    },

    searchSongs: async (query: string, page: number = 1) => {
      return this.request(`/api/songs/search?q=${query}&page=${page}`);
    },

    getPublicSongs: async (page: number = 1, pageSize: number = 20) => {
      return this.request(`/api/public-songs?page=${page}&pageSize=${pageSize}`);
    },

    getArtistSongs: async (artistId: string) => {
      return this.request(`/api/artist-songs?artistId=${artistId}`);
    },
  };

  // =========================================================================
  // UPLOAD HANDLERS
  // =========================================================================

  uploads = {
    uploadFile: async (
      file: Blob | File,
      fileType: 'audio' | 'cover' | 'document',
      onProgress?: (progress: number) => void
    ): Promise<ApiResponse<UploadProgress>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);

      // For React Native, we need different approach
      const isReactNative = typeof fetch !== 'undefined' && !globalThis.document;

      if (isReactNative) {
        return this.uploadFileReactNative(file, fileType);
      }

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              onProgress((e.loaded / e.total) * 100);
            }
          });
        }

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              data: JSON.parse(xhr.responseText).upload,
              status: xhr.status,
            });
          } else {
            resolve({
              success: false,
              error: 'Upload failed',
              status: xhr.status,
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Network error',
            status: 0,
          });
        });

        xhr.open('POST', `${this.baseUrl}/api/upload/file`);
        if (this.sessionToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${this.sessionToken}`);
        }
        xhr.send(formData);
      });
    },

    uploadFileReactNative: async (
      file: Blob | File,
      fileType: string
    ): Promise<ApiResponse<UploadProgress>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);

      return this.request('/api/upload/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData as any,
      });
    },

    saveUploadJob: async (data: any) => {
      return this.request('/api/upload/save-job', {
        method: 'POST',
        body: data,
      });
    },

    publishSong: async (data: any) => {
      return this.request('/api/upload/publish', {
        method: 'POST',
        body: data,
      });
    },

    extractMetadata: async (file: Blob | File, fileType: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);

      return this.request('/api/upload/extract-metadata', {
        method: 'POST',
        body: formData as any,
      });
    },
  };

  // =========================================================================
  // ADMIN HANDLERS
  // =========================================================================

  admin = {
    getUsers: async (page: number = 1, pageSize: number = 20) => {
      return this.request(`/api/admin/users?page=${page}&pageSize=${pageSize}`);
    },

    getUserById: async (id: string) => {
      return this.request(`/api/admin/users/${id}`);
    },

    updateUser: async (id: string, data: any) => {
      return this.request(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: data,
      });
    },

    bulkUpdateUsers: async (updates: Array<{ id: string; [key: string]: any }>) => {
      return this.request('/api/admin/users/bulk', {
        method: 'POST',
        body: { updates },
      });
    },

    getUserVerification: async (userId: string) => {
      return this.request(`/api/admin/users/${userId}/verification`);
    },

    updateUserVerification: async (userId: string, data: any) => {
      return this.request(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        body: data,
      });
    },

    suspendUser: async (id: string, reason: string) => {
      return this.request(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: { banned: true, banReason: reason },
      });
    },

    unsuspendUser: async (id: string) => {
      return this.request(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: { banned: false, banReason: null },
      });
    },
  };

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  /**
   * Set request timeout
   */
  setTimeout(timeout: number) {
    this.requestTimeout = timeout;
  }

  /**
   * Set retry attempts
   */
  setRetries(retries: number) {
    this.retryAttempts = retries;
  }

  /**
   * Clear session and reset client
   */
  reset() {
    this.sessionToken = null;
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionToken !== null;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const mobileApi = new MobileApiClient();

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default MobileApiClient;
