import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users, usersVerification } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserVerification, createUserVerification } from "@/lib/user-verification";
import { sendEmail } from "@/lib/email";

// POST - Submit profile for verification
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = userData[0];

    // Check if verification record exists
    let verification = await getUserVerification(session.user.id);

    if (!verification) {
      // Create verification record if it doesn't exist
      await createUserVerification(session.user.id, {});
      verification = await getUserVerification(session.user.id);
    }

    // Update verification status to 'submitted'
    await db
      .update(usersVerification)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(usersVerification.userId, session.user.id));

    // Send email notification to user
    try {
      await sendEmail({
        to: currentUser.email,
        subject: "Profile Submitted for Verification - DXL Music Hub",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
              ul { padding-left: 20px; }
              li { margin: 10px 0; }
              .checkmark { color: #28a745; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Verification Submitted Successfully!</h1>
              </div>
              <div class="content">
                <p>Dear ${currentUser.name},</p>

                <p>Thank you for submitting your profile for verification on <strong>DXL Music Hub</strong>.</p>

                <div class="info-box">
                  <h3>📋 What Happens Next?</h3>
                  <ul>
                    <li><span class="checkmark">✓</span> Our team will review your submitted information</li>
                    <li><span class="checkmark">✓</span> We'll verify your government ID and signature documents</li>
                    <li><span class="checkmark">✓</span> We'll confirm all details are accurate and complete</li>
                    <li><span class="checkmark">✓</span> You'll receive an email notification with the outcome</li>
                  </ul>
                </div>

                <div class="highlight">
                  <h3>⏰ Processing Time</h3>
                  <p><strong>Verification typically takes 2-3 working days.</strong> In some cases, it may take longer if additional verification is required.</p>
                </div>

                <div class="info-box">
                  <h3>⚠️ Important Reminder</h3>
                  <p>Please ensure that all information submitted is <strong>true and correct</strong>. Providing false or misleading information may result in:</p>
                  <ul>
                    <li>Rejection of your verification request</li>
                    <li>Suspension or termination of your account</li>
                    <li>Legal consequences where applicable</li>
                  </ul>
                </div>

                <div class="info-box">
                  <h3>📞 Need Help?</h3>
                  <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                </div>

                <p>We appreciate your patience and look forward to verifying your account!</p>

                <p>Best regards,<br><strong>The DXL Music Hub Team</strong></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} DXL Music Hub. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Dear ${currentUser.name},

Thank you for submitting your profile for verification on DXL Music Hub.

What Happens Next?
- Our team will review your submitted information
- We'll verify your government ID and signature documents
- We'll confirm all details are accurate and complete
- You'll receive an email notification with the outcome

Processing Time:
Verification typically takes 2-3 working days. In some cases, it may take longer if additional verification is required.

Important Reminder:
Please ensure that all information submitted is true and correct. Providing false or misleading information may result in rejection of your verification request, suspension or termination of your account, or legal consequences where applicable.

Need Help?
If you have any questions or concerns, please don't hesitate to contact our support team.

We appreciate your patience and look forward to verifying your account!

Best regards,
The DXL Music Hub Team
        `,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue even if email fails - we don't want to fail the submission
    }

    return NextResponse.json({
      success: true,
      message: "Your profile has been submitted for verification successfully!"
    });
  } catch (error) {
    console.error("Error submitting for verification:", error);
    return NextResponse.json(
      { error: "Failed to submit for verification. Please try again." },
      { status: 500 }
    );
  }
}
