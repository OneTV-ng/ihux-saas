import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { user, userProfiles } from "@/db/schema";
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
      case "resend_code":
        return this.resendVerificationCode(request);
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
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email.toLowerCase()))
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
      const existingUser = await db
        .select({ id: user.id, emailVerified: user.emailVerified })
        .from(user)
        .where(eq(user.email, email.toLowerCase()))
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
        .select({ id: user.id })
        .from(user)
        .where(like(user.username, username))
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
      const { email, password, firstname, lastname, username, gender, ref_code } = body;
      // Get tenant from env or util
      let tenant = process.env.TENANT;
      try {
        // Try to use util if available
        const { getTenant } = await import("@/lib/tenant");
        tenant = getTenant();
      } catch {}

      // Validation
      if (!email || !password || !firstname || !lastname) {
        return this.errorResponse(
          "auth.register",
          "auth",
          "Email, password, firstname, and lastname are required",
          422,
          "ValidationError",
          { required: ["email", "password", "firstname", "lastname"] }
        );
      }

      // Check if email already exists
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email.toLowerCase()))
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

      // Check username availability if provided
      if (username) {
        const existingUsernameCheck = await db
          .select({ id: user.id })
          .from(user)
          .where(like(user.username, username))
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
      }

      // Create user using Better Auth
      const { user: newUser } = await auth.api.signUpEmail({
        body: {
          email: email.toLowerCase(),
          password,
          name: `${firstname} ${lastname}`
      
        },
      });

      // Update user with username and emailVerified based on EMAIL_VERIFICATION setting
      const emailVerificationMode = process.env.EMAIL_VERIFICATION || "BEFORE";
      const updateData: any = {};
      
      if (username) {
        updateData.username = username;
      }

       if (tenant) {
        updateData.tenant = tenant;
      }
      
      if (firstname) updateData.firstName = firstname;
      if (lastname) updateData.lastName = lastname; 
      if(ref_code) updateData.ref_code = ref_code;
      
      // Set emailVerified based on mode
      if (emailVerificationMode === "NO" || emailVerificationMode === "BEFORE") {
        updateData.emailVerified = true;
      }
      
      if (Object.keys(updateData).length > 0) {
        await db
          .update(user)
          .set(updateData)
          .where(eq(user.id, newUser.id));
      }

      // Create user profile with additional fields (without username, it's in user table)
      await db.insert(userProfiles).values({
        id: randomUUID(),
        userId: newUser.id,
        firstname,
        lastname,
        language: "en",
        platform: "web",
        metadata: {
          gender: gender || null,
          ref_code: ref_code || null,
          registered_at: new Date().toISOString(),
        },
      });

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
          message: "Registration successful. You can now login.",
        },
        "Registration successful. You can now login."
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
        .update(user)
        .set({ emailVerified: true })
        .where(eq(user.email, email.toLowerCase()));

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
        .select({ id: user.id, emailVerified: user.emailVerified })
        .from(user)
        .where(eq(user.email, email.toLowerCase()))
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
}
