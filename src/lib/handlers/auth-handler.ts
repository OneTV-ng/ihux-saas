import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userProfiles, User, account } from "@/db/schema";
import { eq, or, like } from "drizzle-orm";
import { DxlApiHandler, DxlApiContext, DxlApiResponse } from "@/lib/dxl-api-handler";
import { createAndSendPin, verifyPin } from "@/lib/pin-service";
import { auth } from "@/lib/auth";

export class AuthHandler extends DxlApiHandler {
  async process(request: NextRequest, operation: string): Promise<DxlApiResponse> {
    const context = await this.extractContext(request);

    switch (operation) {
      case "check.email":
        return this.checkEmailAvailability(request);
      case "check.email.verified":
        return this.checkEmailVerified(request);
      case "check.username":
        return this.checkUsernameAvailability(request);
      case "register":
        return this.register(request);
      case "send_verification_code":
        return this.sendVerificationCode(request);
      case "verify_email":
        return this.verifyEmail(request);
      case "verify_pin":
        return this.verifyPin(request);
      case "resend_code":
        return this.resendVerificationCode(request);
      case "resend_reset_pin":
        return this.resendResetPin(request);
      default:
        return this.errorResponse(
          `auth.${operation}`,
          "auth",
          "Invalid operation",
          400,
          "BadRequest"
        );
    }
  }

  /**
   * Check if email is available
   */
  private async checkEmailAvailability(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const email = url.searchParams.get("email");

      console.log("[AUTH] Checking email availability:", email);

      if (!email) {
        return this.errorResponse(
          "auth.check.email",
          "auth",
          "Email is required",
          400,
          "BadRequest",
          { field: "email" }
        );
      }

      // Check if email exists
      const existingUser: User[] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      const available = existingUser.length === 0;

      console.log("[AUTH] Email check result:", { email, available });

      return this.successResponse(
        "auth.check.email",
        "auth",
        {
          email,
          available,
          message: available ? "Email is available" : "Email is already taken",
        },
        available ? "Email is available" : "Email is already taken"
      );
    } catch (error: any) {
      console.error("[AUTH] Error checking email availability:", error);
      return this.errorResponse(
        "auth.check.email",
        "auth",
        error.message || "Failed to check email availability",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Check if email exists and is verified
   */
  private async checkEmailVerified(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const email = url.searchParams.get("email");

      if (!email) {
        return this.errorResponse(
          "auth.check.email.verified",
          "auth",
          "Email is required",
          400,
          "BadRequest",
          { field: "email" }
        );
      }


      // Check if email exists and get verification status
      const existingUser: User[]= await db
        .select({ id: users.id, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      const exists = existingUser.length > 0;
      const verified = exists ? existingUser[0].emailVerified : false;

      return this.successResponse(
        "auth.check.email.verified",
        "auth",
        {
          email,
          exists,
          verified,
        },
        exists 
          ? (verified ? "Email is verified" : "Email is not verified")
          : "Email does not exist"
      );
    } catch (error: any) {
      return this.errorResponse(
        "auth.check.email.verified",
        "auth",
        error.message || "Failed to check email verification",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Check if username is available
   */
  private async checkUsernameAvailability(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const username = url.searchParams.get("username");

      if (!username) {
        return this.errorResponse(
          "auth.check.username",
          "auth",
          "Username is required",
          400,
          "BadRequest",
          { field: "username" }
        );
      }

      // Validate username format (alphanumeric, underscores, hyphens, 3-20 chars)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return this.errorResponse(
          "auth.check.username",
          "auth",
          "Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens",
          422,
          "ValidationError",
          { field: "username" }
        );
      }

      // Check if username exists (case-insensitive)
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.username, username))
        .limit(1);

      const available = existingUser.length === 0;

      return this.successResponse(
        "auth.check.username",
        "auth",
        {
          username,
          available,
          message: available ? "Username is available" : "Username is already taken",
        },
        available ? "Username is available" : "Username is already taken"
      );
    } catch (error: any) {
      console.error("Error checking username availability:", error);
      return this.errorResponse(
        "auth.check.username",
        "auth",
        error.message || "Failed to check username availability",
        500,
        "InternalError",
        { originalError: error.toString() }
      );
    }
  }

  /**
   * Register new user with firstname, lastname, username
   */
  private async register(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      var { email, password, firstname, lastname, username, tenant, gender, ref_code } = body;

      // Get tenant from env or util
   //   if(!tenant) tenant  = process.env.TENANT;
      
      try {
        // Try to use util if available
        const { getTenant } = await import("@/lib/tenant");
      if(!tenant) {
            tenant =(process.env.TENANT)?process.env.TENANT: getTenant();
      }

      } catch {}

      // Validation
      if (!email || !password || !firstname || !lastname || !username) {
        console.log("[REGISTER] Missing required fields:", { email: !!email, password: !!password, firstname: !!firstname, lastname: !!lastname, username: !!username });
        return this.errorResponse(
          "auth.register",
          "auth",
          "Email, password, firstname, lastname, and username are required",
          422,
          "ValidationError",
          { required: ["email", "password", "firstname", "lastname", "username"] }
        );
      }

      // Validate password
      if (password.length < 8) {
        console.log(`[REGISTER] Password too short: ${password.length} chars (min 8)`);
        return this.errorResponse(
          "auth.register",
          "auth",
          "Password must be at least 8 characters",
          422,
          "ValidationError",
          { field: "password" }
        );
      }

      // Validate username
      if (username.trim() === "") {
        return this.errorResponse(
          "auth.register",
          "auth",
          "Username cannot be empty",
          422,
          "ValidationError",
          { field: "username" }
        );
      }

      if (username.length < 3 || username.length > 20) {
        return this.errorResponse(
          "auth.register",
          "auth",
          "Username must be between 3 and 20 characters",
          422,
          "ValidationError",
          { field: "username" }
        );
      }

      // Check if email already exists
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return this.errorResponse(
          "auth.register",
          "auth",
          "Email is already registered",
          422,
          "ValidationError",
          { field: "email" }
        );
      }

      // Check username availability (now always have a username)
      const existingUsernameCheck = await db
        .select({ id: users.id })
        .from(users)
        .where(like(users.username, username))
        .limit(1);

      if (existingUsernameCheck.length > 0) {
        return this.errorResponse(
          "auth.register",
          "auth",
          "Username is already taken",
          422,
          "ValidationError",
          { field: "username" }
        );
      }

      // Create user using Better Auth - it handles password hashing internally
      console.log("[REGISTER] Creating user with Better Auth:", {
        email: email.toLowerCase(),
        name: `${firstname} ${lastname}`,
        password_length: password.length
      });

      const { user: newUser } = await auth.api.signUpEmail({
        body: {
          email: email.toLowerCase(),
          password: password,
          name: `${firstname} ${lastname}`
        },
      });

      console.log("[REGISTER] User created successfully:", { userId: newUser.id, email: newUser.email });

      // Copy password from account table to users table
      console.log("[REGISTER] Copying password from account to users table");
      const emailAccount = await db
        .select({ password: account.password })
        .from(account)
        .where(eq(account.userId, newUser.id))
        .limit(1);

      if (emailAccount.length > 0 && emailAccount[0].password) {
        console.log("[REGISTER] Found account password, copying to users.passwordHash");
        await db
          .update(users)
          .set({ passwordHash: emailAccount[0].password })
          .where(eq(users.id, newUser.id));
      }

      // Update user with username and email verification
      const emailVerificationMode = process.env.EMAIL_VERIFICATION || "BEFORE";
      const updateData: any = {};

      if (username) {
        updateData.username = username;
      }

      if (tenant) {
        updateData.tenant = tenant;
      }

      // Set emailVerified based on mode or if ref_code is provided
      // If ref_code is provided, always verify email automatically
      if (ref_code || emailVerificationMode === "NO" || emailVerificationMode === "BEFORE") {
        updateData.emailVerified = true;
      }

      if (Object.keys(updateData).length > 0) {
        console.log(`[REGISTER] Updating user ${newUser.id} with:`, updateData);
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, newUser.id));
      }

      // Create user profile with additional fields
      console.log("[REGISTER] Creating user profile for user:", newUser.id);
      await db.insert(userProfiles).values({
        id: randomUUID(),
        userId: newUser.id,
        firstname,
        lastname,
        platform: "web",
        metadata: {
          gender: gender || null,
          ref_code: ref_code || null,
          registered_at: new Date().toISOString(),
        },
      });

      const emailVerified = ref_code || emailVerificationMode === "NO" || emailVerificationMode === "BEFORE";

      return this.successResponse(
        "auth.register",
        "auth",
        {
          user_id: newUser.id,
          email: newUser.email,
          firstname,
          lastname,
          username,
          gender,
          ref_code,
          validCode: ref_code ? true : undefined,
          emailVerified,
          message: ref_code
            ? "We are good to go"
            : "Registration successful. You can now login.",
        },
        ref_code
          ? "We are good to go"
          : "Registration successful. You can now login."
      );
    } catch (error: any) {
      return this.errorResponse(
        "auth.register",
        "auth",
        error.message || "Registration failed",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Send verification code to email (for signup - before user exists)
   */
  private async sendVerificationCode(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { email } = body;

      console.log("[AUTH] Sending verification code to:", email);

      if (!email) {
        return this.errorResponse(
          "auth.send_verification_code",
          "auth",
          "Email is required",
          400,
          "BadRequest",
          { field: "email" }
        );
      }

      // For signup: just send the verification code without checking if user exists
      // This allows email verification during the signup process
      await createAndSendPin({ email: email.toLowerCase(), type: "verification" });

      console.log("[AUTH] Verification code sent successfully");

      return this.successResponse(
        "auth.send_verification_code",
        "auth",
        {
          email,
          code_sent: true,
          expires_in: "10 minutes",
        },
        "Verification code sent to your email"
      );
    } catch (error: any) {
      console.error("[AUTH] Error sending verification code:", error);
      return this.errorResponse(
        "auth.send_verification_code",
        "auth",
        error.message || "Failed to send verification code",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Verify email with code
   */
  private async verifyEmail(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { email, code } = body;

      if (!email || !code) {
        return this.errorResponse(
          "auth.verify_email",
          "auth",
          "Email and code are required",
          422,
          "ValidationError",
          { required: ["email", "code"] }
        );
      }

      // Verify PIN
      const pinResult = await verifyPin({
        email: email.toLowerCase(),
        pin: code,
        type: "verification",
      });

      if (!pinResult.valid) {
        return this.errorResponse(
          "auth.verify_email",
          "auth",
          pinResult.error || "Invalid or expired verification code",
          422,
          "ValidationError",
          { field: "code" }
        );
      }

      // Update user as verified
      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.email, email.toLowerCase()));

      return this.successResponse(
        "auth.verify_email",
        "auth",
        {
          email,
          verified: true,
          message: "Email verified successfully",
        },
        "Email verified successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "auth.verify_email",
        "auth",
        error.message || "Email verification failed",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Verify PIN for password reset
   */
  private async verifyPin(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { email, pin } = body;

      if (!email || !pin) {
        return this.errorResponse(
          "auth.verify_pin",
          "auth",
          "Email and PIN are required",
          400,
          "BadRequest",
          { required: ["email", "pin"] }
        );
      }

      // Use pin-service to verify PIN for reset
      const { verifyPin } = await import("@/lib/pin-service");
      const result = await verifyPin({
        email: email.toLowerCase(),
        pin,
        type: "reset",
      });

      if (result.valid) {
        return this.successResponse(
          "auth.verify_pin",
          "auth",
          {
            email,
            verified: true,
            message: "PIN verified successfully",
          },
          "PIN verified successfully"
        );
      } else {
        return this.errorResponse(
          "auth.verify_pin",
          "auth",
          result.error || "Invalid or expired PIN",
          422,
          "ValidationError",
          { field: "pin" }
        );
      }
    } catch (error: any) {
      console.error("[AUTH] Error verifying PIN:", error);
      return this.errorResponse(
        "auth.verify_pin",
        "auth",
        error.message || "PIN verification failed",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Resend verification code
   */
  private async resendVerificationCode(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return this.errorResponse(
          "auth.resend_code",
          "auth",
          "Email is required",
          400,
          "BadRequest"
        );
      }

      // Check if user exists
      const existingUser = await db
        .select({ id: users.id, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length === 0) {
        return this.errorResponse(
          "auth.resend_code",
          "auth",
          "User not found",
          404,
          "NotFound"
        );
      }

      if (existingUser[0].emailVerified) {
        return this.errorResponse(
          "auth.resend_code",
          "auth",
          "Email is already verified",
          400,
          "BadRequest"
        );
      }

      // Send new verification code
      await createAndSendPin({ email: email.toLowerCase(), type: "verification" });

      return this.successResponse(
        "auth.resend_code",
        "auth",
        {
          email,
          code_sent: true,
          expires_in: "10 minutes",
        },
        "New verification code sent to your email"
      );
    } catch (error: any) {
      return this.errorResponse(
        "auth.resend_code",
        "auth",
        error.message || "Failed to resend verification code",
        500,
        "InternalError"
      );
    }
  }

  /**
   * Resend password reset PIN
   */
  private async resendResetPin(request: NextRequest): Promise<DxlApiResponse> {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return this.errorResponse(
          "auth.resend_reset_pin",
          "auth",
          "Email is required",
          400,
          "BadRequest"
        );
      }

      // Check if user exists
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length === 0) {
        return this.errorResponse(
          "auth.resend_reset_pin",
          "auth",
          "User not found",
          404,
          "NotFound"
        );
      }

      // Send new password reset PIN
      await createAndSendPin({ email: email.toLowerCase(), type: "reset" });

      return this.successResponse(
        "auth.resend_reset_pin",
        "auth",
        {
          email,
          pin_sent: true,
          expires_in: "10 minutes",
        },
        "New password reset PIN sent to your email"
      );
    } catch (error: any) {
      return this.errorResponse(
        "auth.resend_reset_pin",
        "auth",
        error.message || "Failed to resend reset PIN",
        500,
        "InternalError"
      );
    }
  }
}
