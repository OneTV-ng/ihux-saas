"use client";

import { useToast } from "./use-toast";
import { useCallback } from "react";

type MessageType = "success" | "error" | "info";

export function useShowMessage() {
  const { toast } = useToast();

  const showMessage = useCallback(
    (message: string, type: MessageType = "success", description?: string) => {
      const variant = type === "error" ? "destructive" : "default";

      toast({
        title: message,
        description: description,
        variant: variant,
      });
    },
    [toast]
  );

  const success = useCallback(
    (message: string, description?: string) => {
      showMessage(message, "success", description);
    },
    [showMessage]
  );

  const error = useCallback(
    (message: string, description?: string) => {
      showMessage(message, "error", description);
    },
    [showMessage]
  );

  const info = useCallback(
    (message: string, description?: string) => {
      showMessage(message, "info", description);
    },
    [showMessage]
  );

  return {
    showMessage,
    success,
    error,
    info,
  };
}
