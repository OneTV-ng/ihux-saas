"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, File, Music, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  type?: "profile" | "audio" | "document" | "image" | "files" | "thumbnail" | "header" | "governmentid" | "signature";
  onUploadComplete?: (url: string, fileInfo: any) => void;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  label,
  accept = "image/*,audio/*,.pdf,.doc,.docx",
  maxSize = 10,
  type = "files",
  onUploadComplete,
  value,
  disabled = false,
  className,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("audio/")) {
      setPreview("audio");
    } else {
      setPreview("document");
    }

    // Upload file
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setFileInfo(result);
      if (onUploadComplete) {
        onUploadComplete(result.url, result);
      }
    } catch (error: any) {
      alert(error.message || "Failed to upload file");
      setPreview("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onUploadComplete) {
      onUploadComplete("", null);
    }
  };

  const renderPreview = () => {
    if (!preview) return null;

    if (preview === "audio") {
      return (
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <Music className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{fileInfo?.filename || "Audio file"}</p>
            <p className="text-xs text-muted-foreground">
              {fileInfo?.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : ""}
            </p>
          </div>
          {fileInfo?.url && (
            <audio controls className="max-w-[200px]">
              <source src={fileInfo.url} type={fileInfo.type} />
            </audio>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (preview === "document") {
      return (
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <File className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{fileInfo?.filename || "Document"}</p>
            <p className="text-xs text-muted-foreground">
              {fileInfo?.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : ""}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Image preview
    return (
      <div className="relative group">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-40 object-cover rounded-lg border"
        />
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
          disabled={disabled || isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      {!preview ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      ) : (
        renderPreview()
      )}
    </div>
  );
}
