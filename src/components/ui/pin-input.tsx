"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (pin: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  error?: boolean;
}

export function PinInput({ 
  length = 6, 
  value = "",
  onChange,
  onComplete, 
  disabled = false,
  autoFocus = false,
  className,
  error = false,
}: PinInputProps) {
  const [pins, setPins] = useState<string[]>(Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Sync with external value
  useEffect(() => {
    if (value) {
      const newPins = value.split("").slice(0, length);
      while (newPins.length < length) {
        newPins.push("");
      }
      setPins(newPins);
    }
  }, [value, length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    if (newValue && !/^\d$/.test(newValue)) {
      return;
    }

    const newPins = [...pins];
    newPins[index] = newValue;
    setPins(newPins);

    // Call onChange callback
    const fullValue = newPins.join("");
    onChange?.(fullValue);

    // Move to next input if value entered
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits filled (auto-submit on last digit)
    if (newValue && index === length - 1 && newPins.every((pin) => pin !== "")) {
      onComplete?.(fullValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      
      if (pins[index]) {
        // Clear current digit
        const newPins = [...pins];
        newPins[index] = "";
        setPins(newPins);
        onChange?.(newPins.join(""));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newPins = [...pins];
        newPins[index - 1] = "";
        setPins(newPins);
        onChange?.(newPins.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle arrow keys
    else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    // Handle digits
    else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      handleChange(index, e.key);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").slice(0, length);
    
    if (digits) {
      const newPins = digits.split("");
      while (newPins.length < length) {
        newPins.push("");
      }
      setPins(newPins);
      onChange?.(newPins.join(""));
      
      // Focus on the next empty input or last input
      const nextEmptyIndex = newPins.findIndex((pin) => pin === "");
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      
      // Call onComplete if all digits filled
      if (digits.length === length) {
        onComplete?.(digits);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select all text in the input
    inputRefs.current[index]?.select();
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-background",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-input focus:border-primary focus:ring-primary",
            focusedIndex === index && "scale-110 shadow-lg",
            pin && "bg-primary/5 border-primary/50",
            "animate-in fade-in-0 zoom-in-95 duration-300"
          )}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}
