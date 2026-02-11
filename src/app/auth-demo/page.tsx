"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

export default function AuthDemoPage() {
  // Email check
  const [email, setEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  // Username check
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Registration
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFirstname, setRegFirstname] = useState("");
  const [regLastname, setRegLastname] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regMessage, setRegMessage] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Verification
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const checkEmail = async () => {
    if (!email) return;
    setEmailChecking(true);
    try {
      const res = await fetch(`/api/dxl/v3?@=auth.check.email&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailAvailable(data.data?.available ?? null);
    } catch (error) {
      console.error("Email check failed:", error);
    } finally {
      setEmailChecking(false);
    }
  };

  const checkUsername = async () => {
    if (!username) return;
    setUsernameChecking(true);
    try {
      const res = await fetch(`/api/dxl/v3?@=auth.check.username&username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameAvailable(data.data?.available ?? null);
    } catch (error) {
      console.error("Username check failed:", error);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleRegister = async () => {
    setRegLoading(true);
    setRegMessage("");
    try {
      const res = await fetch("/api/dxl/v3?@=auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          firstname: regFirstname,
          lastname: regLastname,
          username: regUsername || undefined,
        }),
      });
      const data = await res.json();
      setRegMessage(data.message || (data.status ? "Registration successful! Check your email." : "Registration failed."));
    } catch (error: any) {
      setRegMessage("Error: " + error.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifyLoading(true);
    setVerifyMessage("");
    try {
      const res = await fetch("/api/dxl/v3?@=auth.verify_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifyEmail,
          code: verifyCode,
        }),
      });
      const data = await res.json();
      setVerifyMessage(data.message || (data.status ? "Email verified successfully!" : "Verification failed."));
    } catch (error: any) {
      setVerifyMessage("Error: " + error.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerifyLoading(true);
    setVerifyMessage("");
    try {
      const res = await fetch("/api/dxl/v3?@=auth.resend_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      setVerifyMessage(data.message || (data.status ? "New code sent!" : "Failed to send code."));
    } catch (error: any) {
      setVerifyMessage("Error: " + error.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DXL Auth API Demo</h1>
        <p className="text-muted-foreground">Test the authentication endpoints</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Availability Check */}
        <Card>
          <CardHeader>
            <CardTitle>Check Email Availability</CardTitle>
            <CardDescription>Verify if an email is available for registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailAvailable(null);
                  }}
                />
                <Button onClick={checkEmail} disabled={emailChecking || !email}>
                  {emailChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                </Button>
              </div>
            </div>
            {emailAvailable !== null && (
              <div className={`flex items-center gap-2 p-2 rounded ${emailAvailable ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {emailAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span>{emailAvailable ? "Email is available" : "Email is already taken"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Username Availability Check */}
        <Card>
          <CardHeader>
            <CardTitle>Check Username Availability</CardTitle>
            <CardDescription>Verify if a username is available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="username123"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameAvailable(null);
                  }}
                />
                <Button onClick={checkUsername} disabled={usernameChecking || !username}>
                  {usernameChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                </Button>
              </div>
            </div>
            {usernameAvailable !== null && (
              <div className={`flex items-center gap-2 p-2 rounded ${usernameAvailable ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {usernameAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span>{usernameAvailable ? "Username is available" : "Username is already taken"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Register New User</CardTitle>
            <CardDescription>Create a new account with firstname, lastname, and optional username</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  placeholder="John"
                  value={regFirstname}
                  onChange={(e) => setRegFirstname(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  placeholder="Doe"
                  value={regLastname}
                  onChange={(e) => setRegLastname(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Username (optional)</Label>
              <Input
                placeholder="johndoe123"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleRegister}
              disabled={regLoading || !regEmail || !regPassword || !regFirstname || !regLastname}
              className="w-full"
            >
              {regLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Register
            </Button>
            {regMessage && (
              <div className="p-3 rounded bg-muted">
                {regMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Verification */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>6-Digit Code</Label>
                <Input
                  placeholder="123456"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleVerify}
                disabled={verifyLoading || !verifyEmail || !verifyCode}
                className="flex-1"
              >
                {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify Email
              </Button>
              <Button
                onClick={handleResendCode}
                disabled={verifyLoading || !verifyEmail}
                variant="outline"
              >
                Resend Code
              </Button>
            </div>
            {verifyMessage && (
              <div className="p-3 rounded bg-muted">
                {verifyMessage}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
