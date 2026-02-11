/**
 * DXL Music Hub API Client v3
 * Frontend integration library for accessing DXL API
 */

export interface DxlApiConfig {
  baseUrl: string;
  apiKey?: string;
  jwtToken?: string;
  platform?: "web" | "mobile" | "desktop";
  platformVersion?: string;
  timeout?: number;
  debug?: boolean;
  headers?: Record<string, string>;
}

export interface DxlApiResponse<T = any> {
  info: {
    action_requested: string;
    response_module: string;
    module_version: string;
    timestamp: string;
    request_id: string;
    execution_time_ms: number;
  };
  status: boolean;
  data: T;
  message: string;
  error_details?: {
    code: number;
    type: string;
    details?: any;
  };
}

export class DxlApiClient {
  private config: Required<DxlApiConfig>;

  constructor(config: DxlApiConfig) {
    this.config = {
      baseUrl: config.baseUrl || "/api/dxl/v3",
      apiKey: config.apiKey || "",
      jwtToken: config.jwtToken || "",
      platform: config.platform || "web",
      platformVersion: config.platformVersion || "1.0.0",
      timeout: config.timeout || 15000,
      debug: config.debug || false,
      headers: config.headers || {},
    };
  }

  /**
   * Make a request to the DXL API
   */
  async request<T = any>(
    action: string,
    options: {
      method?: "GET" | "POST" | "PATCH" | "DELETE";
      params?: Record<string, any>;
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<DxlApiResponse<T>> {
    const {
      method = "GET",
      params = {},
      body,
      headers = {},
      timeout = this.config.timeout,
    } = options;

    // Build URL with action and params
    const url = new URL(this.config.baseUrl, window.location.origin);
    url.searchParams.set("@", action);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    // Build headers
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      "X-PLATFORM": this.config.platform,
      "X-PLATFORM-VERSION": this.config.platformVersion,
      ...this.config.headers,
      ...headers,
    };

    if (this.config.apiKey) {
      requestHeaders["X-API-KEY"] = this.config.apiKey;
    }

    if (this.config.jwtToken) {
      requestHeaders["Authorization"] = `Bearer ${this.config.jwtToken}`;
    }

    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (this.config.debug) {
        console.log(`[DXL API] ${method} ${action}`, { params, body });
      }

      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: DxlApiResponse<T> = await response.json();

      if (this.config.debug) {
        console.log(`[DXL API] Response ${action}`, data);
      }

      if (!data.status && this.config.debug) {
        console.error(`[DXL API] Error ${action}`, data.error_details);
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(action: string, params?: Record<string, any>): Promise<DxlApiResponse<T>> {
    return this.request<T>(action, { method: "GET", params });
  }

  /**
   * POST request helper
   */
  async post<T = any>(action: string, body?: any, params?: Record<string, any>): Promise<DxlApiResponse<T>> {
    return this.request<T>(action, { method: "POST", body, params });
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(action: string, body?: any, params?: Record<string, any>): Promise<DxlApiResponse<T>> {
    return this.request<T>(action, { method: "PATCH", body, params });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(action: string, params?: Record<string, any>): Promise<DxlApiResponse<T>> {
    return this.request<T>(action, { method: "DELETE", params });
  }

  /**
   * Update JWT token
   */
  setToken(token: string) {
    this.config.jwtToken = token;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  // ===== Songs API =====

  /**
   * List songs with pagination and filters
   */
  async listSongs(options: {
    page?: number;
    limit?: number;
    artist?: string;
    status?: string;
    genre?: string;
    type?: string;
    search?: string;
  } = {}) {
    return this.get("songs.list", options);
  }

  /**
   * Get single song by ID
   */
  async getSong(id: string) {
    return this.get("songs.get", { id });
  }

  /**
   * Create a new song
   */
  async createSong(data: {
    type: "single" | "album" | "medley";
    title: string;
    artist_id: string;
    genre?: string;
    language?: string;
    upc?: string;
    cover?: string;
    tracks: Array<{
      track_number?: number;
      title: string;
      isrc?: string;
      mp3: string;
      explicit?: "no" | "yes" | "covered";
      lyrics?: string;
      lead_vocal?: string;
      producer?: string;
      writer?: string;
    }>;
  }) {
    return this.post("songs.create", data);
  }

  /**
   * Update song metadata
   */
  async updateSong(id: string, updates: any) {
    return this.patch("songs.update", { id, ...updates });
  }

  /**
   * Delete song (soft delete)
   */
  async deleteSong(id: string) {
    return this.delete("songs.delete", { id });
  }

  // ===== Uploads API =====

  /**
   * Start a file upload
   */
  async startUpload(data: { filename: string; size: number; mime_type: string }) {
    return this.post("uploads.start", data);
  }

  /**
   * Upload a chunk
   */
  async uploadChunk(uploadId: string, chunkNumber: number, data: ArrayBuffer) {
    const url = new URL(this.config.baseUrl, window.location.origin);
    url.searchParams.set("@", "uploads.chunk");

    const headers: HeadersInit = {
      "Upload-ID": uploadId,
      "Chunk-Number": String(chunkNumber),
      "Content-Type": "application/octet-stream",
      ...this.config.headers,
    };

    if (this.config.apiKey) headers["X-API-KEY"] = this.config.apiKey;
    if (this.config.jwtToken) headers["Authorization"] = `Bearer ${this.config.jwtToken}`;

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: data,
    });

    return response.json();
  }

  /**
   * Complete upload
   */
  async completeUpload(uploadId: string, checksum?: string) {
    return this.post("uploads.complete", { upload_id: uploadId, checksum });
  }

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: string) {
    return this.get("uploads.status", { id: uploadId });
  }

  // ===== Admin API =====

  /**
   * Get pending approvals
   */
  async getApprovals() {
    return this.get("admin.approvals");
  }

  /**
   * Approve a song
   */
  async approveSong(songId: string, status: string, note?: string) {
    return this.patch("admin.approve", { song_id: songId, status, note });
  }

  /**
   * Flag a song
   */
  async flagSong(songId: string, flagType: string, reason: string, details?: any) {
    return this.patch("admin.flag", {
      song_id: songId,
      flag_type: flagType,
      reason,
      details,
    });
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return this.get("admin.dashboard.stats");
  }

  /**
   * List admin tasks
   */
  async listTasks(page?: number, limit?: number) {
    return this.get("admin.tasks.list", { page, limit });
  }

  /**
   * Create admin task
   */
  async createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    assigned_to?: string;
    due_date?: string;
  }) {
    return this.post("admin.tasks.create", data);
  }

  /**
   * List alerts
   */
  async listAlerts(status?: string) {
    return this.get("admin.alerts.list", { status });
  }

  /**
   * List royalties
   */
  async listRoyalties(options: {
    page?: number;
    limit?: number;
    period?: string;
    status?: string;
  } = {}) {
    return this.get("admin.royalty.list", options);
  }

  /**
   * Get user royalty inflow
   */
  async getUserRoyaltyInflow(options: {
    user_id?: string;
    artist_id?: string;
    song_id?: string;
  }) {
    return this.get("admin.royalty.user_inflow", options);
  }

  // ========================================
  // AUTH MODULE
  // ========================================

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string) {
    return this.get("auth.check.email", { email });
  }

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username: string) {
    return this.get("auth.check.username", { username });
  }

  /**
   * Register new user
   */
  async register(options: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    username?: string;
  }) {
    return this.post("auth.register", options);
  }

  /**
   * Send verification code to email
   */
  async sendVerificationCode(email: string) {
    return this.post("auth.send_verification_code", { email });
  }

  /**
   * Verify email with code
   */
  async verifyEmail(email: string, code: string) {
    return this.post("auth.verify_email", { email, code });
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string) {
    return this.post("auth.resend_code", { email });
  }
}

// Export singleton instance
let dxlApiClientInstance: DxlApiClient | null = null;

export function initDxlApiClient(config: DxlApiConfig) {
  dxlApiClientInstance = new DxlApiClient(config);
  return dxlApiClientInstance;
}

export function getDxlApiClient(): DxlApiClient {
  if (!dxlApiClientInstance) {
    throw new Error("DXL API Client not initialized. Call initDxlApiClient() first.");
  }
  return dxlApiClientInstance;
}
