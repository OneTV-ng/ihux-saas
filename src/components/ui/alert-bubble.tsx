"use client";

import { useAlert, type AlertType } from "@/contexts/alert-context";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-500/90",
    border: "border-green-600",
    text: "text-white",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    bg: "bg-red-500/90",
    border: "border-red-600",
    text: "text-white",
    icon: <XCircle className="h-5 w-5" />,
  },
  info: {
    bg: "bg-blue-500/90",
    border: "border-blue-600",
    text: "text-white",
    icon: <Info className="h-5 w-5" />,
  },
};

export function AlertContainer() {
  const { alerts, hideAlert } = useAlert();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {alerts.map((alert) => (
        <AlertBubble
          key={alert.id}
          id={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => hideAlert(alert.id)}
        />
      ))}
    </div>
  );
}

interface AlertBubbleProps {
  id: string;
  message: string;
  type: AlertType;
  onClose: () => void;
}

function AlertBubble({ id, message, type, onClose }: AlertBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const style = alertStyles[type];

  useEffect(() => {
    // Trigger animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        backdrop-blur-sm
        transition-all duration-300 ease-out
        ${style.bg} ${style.border} ${style.text}
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      style={{ minWidth: "250px", maxWidth: "400px" }}
    >
      <div className="flex-shrink-0">{style.icon}</div>
      <div className="flex-1 font-medium text-sm">{message}</div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
