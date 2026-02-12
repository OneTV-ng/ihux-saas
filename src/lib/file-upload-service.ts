/**
 * FileUploadService - Reusable service for uploading files to the backend
 * Supports progress tracking, error handling, and retry logic
 */

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  metadata: Record<string, any>;
  status: string;
  createdAt: Date;
}

export interface UploadError {
  message: string;
  code?: string;
}

export class FileUploadService {
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  /**
   * Upload a file without progress tracking
   */
  async uploadFile(file: File, type: "audio" | "cover" | "document", userId?: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      // Get userId if not provided
      let finalUserId = userId;
      if (!finalUserId) {
        try {
          const response = await fetch("/api/auth/me");
          if (response.ok) {
            const data = await response.json();
            finalUserId = data.user?.id;
          }
        } catch (error) {
          console.error("Failed to get user ID:", error);
        }
      }

      const headers: Record<string, string> = {};
      if (finalUserId) {
        headers["x-user-id"] = finalUserId;
      }

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      return data.upload;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadFileWithProgress(
    file: File,
    type: "audio" | "cover" | "document",
    onProgress: (percent: number) => void,
    userId?: string
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let attempt = 0;

      const attemptUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        // Get userId if not provided
        let finalUserId = userId;
        if (!finalUserId) {
          try {
            const response = await fetch("/api/auth/me");
            if (response.ok) {
              const data = await response.json();
              finalUserId = data.user?.id;
            }
          } catch (error) {
            console.error("Failed to get user ID:", error);
          }
        }

        // Track progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.upload);
            } catch (error) {
              reject(new Error("Invalid response format"));
            }
          } else if (xhr.status === 400) {
            reject(new Error("Invalid file"));
          } else if (xhr.status === 401) {
            reject(new Error("Unauthorized"));
          } else if (xhr.status >= 500 && attempt < this.maxRetries) {
            // Retry on server error
            attempt++;
            console.log(`Retrying upload, attempt ${attempt}/${this.maxRetries}`);
            setTimeout(attemptUpload, this.retryDelay * attempt);
          } else {
            reject(new Error("Upload failed"));
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          if (attempt < this.maxRetries) {
            attempt++;
            console.log(`Retrying upload, attempt ${attempt}/${this.maxRetries}`);
            setTimeout(attemptUpload, this.retryDelay * attempt);
          } else {
            reject(new Error("Network error"));
          }
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        xhr.open("POST", "/api/upload/file");
        if (finalUserId) {
          xhr.setRequestHeader("x-user-id", finalUserId);
        }
        xhr.send(formData);
      };

      attemptUpload();
    });
  }

  /**
   * Upload file with cancellation support
   */
  async uploadFileWithCancel(
    file: File,
    type: "audio" | "cover" | "document",
    onProgress: (percent: number) => void,
    userId?: string
  ): Promise<{
    promise: Promise<UploadResult>;
    cancel: () => void;
  }> {
    let xhr: XMLHttpRequest | null = null;

    // Get userId if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          finalUserId = data.user?.id;
        }
      } catch (error) {
        console.error("Failed to get user ID:", error);
      }
    }

    const promise = new Promise<UploadResult>((resolve, reject) => {
      xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr!.status === 200) {
          try {
            const data = JSON.parse(xhr!.responseText);
            resolve(data.upload);
          } catch (error) {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      xhr.open("POST", "/api/upload/file");
      if (finalUserId) {
        xhr.setRequestHeader("x-user-id", finalUserId);
      }
      xhr.send(formData);
    });

    return {
      promise,
      cancel: () => {
        if (xhr) {
          xhr.abort();
          xhr = null;
        }
      },
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    type: "audio" | "cover" | "document"
  ): { valid: boolean; error?: string } {
    const maxSizes: Record<string, number> = {
      audio: 100 * 1024 * 1024, // 100MB
      cover: 10 * 1024 * 1024,  // 10MB
      document: 20 * 1024 * 1024, // 20MB
    };

    // Check size
    if (file.size > maxSizes[type]) {
      return {
        valid: false,
        error: `File too large. Max size: ${maxSizes[type] / 1024 / 1024}MB`,
      };
    }

    // Check file type
    if (type === "audio") {
      if (!file.name.toLowerCase().endsWith(".mp3")) {
        return { valid: false, error: "Only MP3 files are supported" };
      }
    } else if (type === "cover") {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".jpg") && !name.endsWith(".jpeg") && !name.endsWith(".png")) {
        return { valid: false, error: "Only JPG and PNG files are supported" };
      }
    }

    return { valid: true };
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error("Failed to read image"));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get audio duration
   */
  async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration));
        };
        audio.onerror = () => {
          reject(new Error("Failed to read audio"));
        };
        audio.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
