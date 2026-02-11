"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type AlertType = "success" | "error" | "info";

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  duration?: number;
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = "success", duration: number = 3000) => {
    const id = `alert_${Date.now()}_${Math.random()}`;
    const newAlert: Alert = { id, message, type, duration };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-hide after duration
    setTimeout(() => {
      hideAlert(id);
    }, duration);
  }, []);

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
