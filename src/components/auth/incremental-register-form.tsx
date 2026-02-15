"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "./password-input";
import { useAlert } from "@/contexts/alert-context";
import { Check, X, Loader2 } from "lucide-react";

type Step = "firstname" | "lastname" | "refcode" | "username" | "email" | "verify_email" | "gender" | "password" | "complete";

const IncrementalRegisterForm = () => {
  const { showAlert } = useAlert();
  const [step, setStep] = useState<Step>("firstname");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [gender, setGender] = useState("");
  const [refCode, setRefCode] = useState("");
  const [password, setPassword] = useState("");

  // Email verification
  const [emailChecking, setEmailChecking] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Background validation states
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingEmailAvailability, setCheckingEmailAvailability] = useState(false);
  const [checkingUsernameAvailability, setCheckingUsernameAvailability] = useState(false);


  // Background check for email availability
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || email.length < 5) {
        setEmailAvailable(null);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailAvailable(null);
        return;
      }

      setCheckingEmailAvailability(true);
      try {
        const res = await fetch(
          `/api/dxl/v3?@=auth.check.email&email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        setEmailAvailable(data.data?.available ?? false);
      } catch (error) {
        console.error("Email availability check error:", error);
        setEmailAvailable(null);
      } finally {
        setCheckingEmailAvailability(false);
      }
    };

    const timer = setTimeout(checkEmail, 600);
    return () => clearTimeout(timer);
  }, [email]);

  // Background check for username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      const cleanedUsername = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      if (cleanedUsername.length < 3 || cleanedUsername.length > 20) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsernameAvailability(true);
      try {
        const res = await fetch(
          `/api/dxl/v3?@=auth.check.username&username=${encodeURIComponent(cleanedUsername)}`
        );
        const data = await res.json();
        setUsernameAvailable(data.data?.available ?? false);
      } catch (error) {
        console.error("Username availability check error:", error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsernameAvailability(false);
      }
    };

    const timer = setTimeout(checkUsername, 600);
    return () => clearTimeout(timer);
  }, [username]);

  const handleFirstnameNext = () => {
    const trimmedFirstname = firstname.trim();
    if (!trimmedFirstname) {
      showAlert("Please enter your first name", "error");
      return;
    }
    // Format: trim, lowercase, capitalize first letter
    const formattedFirstname = trimmedFirstname.charAt(0).toUpperCase() + trimmedFirstname.slice(1).toLowerCase();
    setFirstname(formattedFirstname);
    setStep("lastname");
    showAlert(`Great! Nice to meet you, ${formattedFirstname}!`, "success");
  };

  const handleLastnameNext = () => {
    const trimmedLastname = lastname.trim();
    if (!trimmedLastname) {
      showAlert(`${firstname}, please enter your last name`, "error");
      return;
    }
    // Format: trim, lowercase, capitalize first letter
    const formattedLastname = trimmedLastname.charAt(0).toUpperCase() + trimmedLastname.slice(1).toLowerCase();
    setLastname(formattedLastname);
    setStep("refcode");
    showAlert(`Perfect, ${firstname}!`, "success");
  };

  const handleRefCodeNext = () => {
    // Ref code is optional, so we can skip validation
    setStep("username");
    if (refCode) {
      showAlert("Great! Now choose your username", "info");
    } else {
      showAlert("No problem! Choose your username", "info");
    }
  };

  const handleUsernameNext = () => {
    // Username is required
    if (!username.trim()) {
      showAlert("Please enter a username", "error");
      return;
    }

    // Clean and validate username
    const cleanedUsername = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();

    if (cleanedUsername.length < 3) {
      showAlert("Username must be at least 3 characters", "error");
      return;
    }
    if (cleanedUsername.length > 20) {
      showAlert("Username must be less than 20 characters", "error");
      return;
    }
    setUsername(cleanedUsername);
    // Always go to email, but skip verification if ref_code is provided
    setStep("email");
    if (refCode) {
      showAlert("Great! Now provide your email (verification skipped with referral code)", "info");
    } else {
      showAlert("Now let's verify your email", "info");
    }
  };


  const handleEmailNext = async () => {
    if (!email.trim()) {
      showAlert(`${firstname}, please enter your email address`, "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert("Please enter a valid email address", "error");
      return;
    }

    // Step 1: Check email availability (is it already registered?)
    setEmailChecking(true);
    try {
      console.log("[SIGNUP] Checking if email is available for registration:", email);
      
      const res = await fetch(
        `/api/dxl/v3?@=auth.check.email&email=${encodeURIComponent(email)}`
      );
      
      console.log("[SIGNUP] Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[SIGNUP] Error response:", errorText);
        showAlert("Error checking email availability", "error");
        setEmailChecking(false);
        return;
      }
      
      const data = await res.json();
      console.log("[SIGNUP] Email availability check result:", data);

      if (data.status) {
        if (data.data?.available) {
          // If ref_code is provided, skip email verification
          if (refCode) {
            console.log("[SIGNUP] Email is available and ref_code provided, skipping verification");
            setStep("gender");
            showAlert("Email verified with referral code!", "success");
          } else {
            // Step 2: Email is available, send verification code
            console.log("[SIGNUP] Email is available, sending verification code");

            const sendRes = await fetch("/api/dxl/v3?@=auth.send_verification_code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            if (!sendRes.ok) {
              showAlert("Failed to send verification code", "error");
              return;
            }

            const sendData = await sendRes.json();
            console.log("[SIGNUP] Verification code send result:", sendData);

            if (sendData.status) {
              setVerificationSent(true);
              setStep("verify_email");
              showAlert("Verification code sent to your email!", "success");
            } else {
              showAlert(sendData.message || "Failed to send verification code", "error");
            }
          }
        } else {
          // Email already registered
          console.log("[SIGNUP] Email is already registered");
          showAlert("This email is already registered", "error");
        }
      } else {
        showAlert(data.message || "Failed to check email", "error");
      }
    } catch (error) {
      console.error("Email availability check error:", error);
      showAlert("Error checking email availability", "error");
    } finally {
      setEmailChecking(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      showAlert(`${firstname}, please enter the 6-digit code`, "error");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/dxl/v3?@=auth.verify_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await res.json();

      if (data.status) {
        setStep("gender");
        showAlert("Email verified successfully!", "success");
      } else {
        showAlert(data.message || "Invalid or expired code", "error");
      }
    } catch (error) {
      showAlert("Error verifying email", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const res = await fetch("/api/dxl/v3?@=auth.resend_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.status) {
        showAlert("New code sent to your email!", "success");
      } else {
        showAlert("Failed to resend code", "error");
      }
    } catch (error) {
      showAlert("Error resending code", "error");
    }
  };

  const handleGenderNext = () => {
    if (!gender) {
      showAlert(`${firstname}, please select your gender`, "error");
      return;
    }
    setStep("password");
    showAlert("Almost done!", "info");
  };

  const handleBack = () => {
    const steps: Step[] = ["firstname", "lastname", "refcode", "username", "email", "verify_email", "gender", "password"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      showAlert(`${firstname}, please enter a password`, "error");
      return;
    }
    if (password.length < 8) {
      showAlert("Password must be at least 8 characters", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dxl/v3?@=auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          username: username || undefined, // Send empty string or undefined if not provided
          email,
          password,
          gender,
          ref_code: refCode || undefined,
        }),
      });

      const data = await res.json();

      if (data.status) {
        setStep("complete");
        showAlert(
          `Welcome, ${firstname}! Your account has been created.`,
          "success"
        );
      } else {
        showAlert(data.message || "Registration failed", "error");
      }
    } catch (error) {
      showAlert("An error occurred during registration", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "complete") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 text-center p-8">
        <div className="rounded-full bg-green-500/20 p-6">
          <Check className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome, {firstname}!</h2>
          <p className="text-muted-foreground">
            Your account has been created successfully!
            <br />
            You can now login with your credentials.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = "/auth/sign")}
          className="mt-4"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-2">
        {["firstname", "lastname", "refcode", "username", "email", "verify_email", "gender", "password"].map((s, i) => {
          const currentStepIndex = ["firstname", "lastname", "refcode", "username", "email", "verify_email", "gender", "password"].indexOf(step);
          return (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                currentStepIndex >= i ? "bg-primary" : "bg-muted"
              }`}
            />
          );
        })}
      </div>

      {step === "firstname" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Welcome to SingFLEX Global Distributions!</h3>
            <p className="text-sm text-muted-foreground">Let's get started. What's your first name?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              type="text"
              placeholder="John"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFirstnameNext()}
              autoFocus
            />
          </div>
          <Button type="button" onClick={handleFirstnameNext} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {step === "lastname" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Great! Nice to meet you, {firstname}!</h3>
            <p className="text-sm text-muted-foreground">What's your last name?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              type="text"
              placeholder="Doe"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLastnameNext()}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button type="button" onClick={handleLastnameNext} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "refcode" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Got a referral code, {firstname}?</h3>
            <p className="text-sm text-muted-foreground">Enter it below or skip if you don't have one</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="refcode">Referral Code (Optional)</Label>
            <Input
              id="refcode"
              type="text"
              placeholder="ABC123"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleRefCodeNext()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              If someone referred you, enter their code here
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button type="button" onClick={handleRefCodeNext} className="flex-1">
              {refCode ? "Continue" : "Skip"}
            </Button>
          </div>
        </div>
      )}

      {step === "username" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Perfect, {firstname}!</h3>
            <p className="text-sm text-muted-foreground">Choose a unique username</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username">Username</Label>
              {checkingUsernameAvailability && (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">Checking...</span>
                </div>
              )}
              {!checkingUsernameAvailability && usernameAvailable === true && username.length >= 3 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" />
                  <span className="text-xs">Available</span>
                </div>
              )}
              {!checkingUsernameAvailability && usernameAvailable === false && username.length >= 3 && (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-3 w-3" />
                  <span className="text-xs">Taken</span>
                </div>
              )}
            </div>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              onKeyDown={(e) => e.key === "Enter" && usernameAvailable && handleUsernameNext()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button
              type="button"
              onClick={handleUsernameNext}
              className="flex-1"
              disabled={!username.trim() || usernameAvailable !== true}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "email" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Almost there, {firstname}!</h3>
            <p className="text-sm text-muted-foreground">What's your email address?</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email</Label>
              {checkingEmailAvailability && (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">Checking...</span>
                </div>
              )}
              {!checkingEmailAvailability && emailAvailable === true && email.length >= 5 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" />
                  <span className="text-xs">Available</span>
                </div>
              )}
              {!checkingEmailAvailability && emailAvailable === false && email.length >= 5 && (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-3 w-3" />
                  <span className="text-xs">Already registered</span>
                </div>
              )}
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && emailAvailable && handleEmailNext()}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button
              type="button"
              onClick={handleEmailNext}
              className="flex-1"
              disabled={emailChecking || (email.length >= 5 && emailAvailable !== true)}
            >
              {emailChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "verify_email" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Check your email, {firstname}!</h3>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium">{email}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && !verifying && handleVerifyEmail()}
              autoFocus
              disabled={verifying}
              className="text-center text-2xl tracking-widest"
            />
            <button
              type="button"
              onClick={handleResendCode}
              className="text-xs text-primary hover:underline self-center"
            >
              Didn't receive the code? Resend
            </button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleVerifyEmail} 
              className="flex-1"
              disabled={verifying || verificationCode.length !== 6}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "gender" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Tell us about yourself, {firstname}!</h3>
            <p className="text-sm text-muted-foreground">What's your gender?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Gender</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={gender === "male" ? "default" : "outline"}
                onClick={() => setGender("male")}
                className="w-full"
              >
                Male
              </Button>
              <Button
                type="button"
                variant={gender === "female" ? "default" : "outline"}
                onClick={() => setGender("female")}
                className="w-full"
              >
                Female
              </Button>
              <Button
                type="button"
                variant={gender === "other" ? "default" : "outline"}
                onClick={() => setGender("other")}
                className="w-full"
              >
                Other
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleGenderNext} 
              className="flex-1"
              disabled={!gender}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "password" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Last step, {firstname}!</h3>
            <p className="text-sm text-muted-foreground">Create a secure password</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              At least 8 characters
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default IncrementalRegisterForm;
