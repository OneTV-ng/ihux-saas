import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (payload: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "SingFLEX <noreply@singflex.com>",
      ...payload,
      text: payload.text || payload.subject, // Ensure text is always present
    });

    console.log("Email sent successfully:", response);

    if (response?.data) return true;
    return false;
  } catch (error: any) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendPinEmail = async ({
  to,
  pin,
  type,
}: {
  to: string;
  pin: string;
  type: "verification" | "reset";
}) => {
  const subject =
    type === "verification"
      ? "Verify your email address"
      : "Reset your password";
  const action = type === "verification" ? "verify your email" : "reset your password";

  // Construct clickable link for PIN-based reset
  let pinLink = "";
  if (type === "reset") {
    // Use production URL if available, fallback to localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    pinLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(to)}&pin=${encodeURIComponent(pin)}`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">Verification Code</h1>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #666666;">
                      Use this code to ${action}. This code will expire in 10 minutes.
                    </p>
                    <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                      <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace;">${pin}</div>
                    </div>
                    ${type === "reset" ? `<p style="margin: 20px 0 0; font-size: 16px; color: #007bff; text-align: center;"><a href="${pinLink}" style="color: #007bff; text-decoration: underline;">Click here to enter your PIN and reset your password</a></p>` : ""}
                    <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #999999;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                      © ${new Date().getFullYear()} SingFLEX. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `Your verification code is: ${pin}\n\nUse this code to ${action}. This code will expire in 10 minutes.\n\n${type === "reset" ? `Reset your password: ${pinLink}\n\n` : ""}If you didn't request this code, please ignore this email.`;

  return sendEmail({ to, subject, html, text });
};

export const sendVerificationLinkEmail = async ({
  to,
  link,
  type,
}: {
  to: string;
  link: string;
  type: "verification" | "reset";
}) => {
  const subject =
    type === "verification"
      ? "Verify your email address"
      : "Reset your password";
  const action = type === "verification" ? "verify your email" : "reset your password";
  const buttonText = type === "verification" ? "Verify Email" : "Reset Password";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">${subject}</h1>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #666666;">
                      Click the button below to ${action}. This link will expire in 10 minutes.
                    </p>
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td style="border-radius: 6px; background-color: #007bff;">
                          <a href="${link}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                            ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #999999;">
                      Or copy and paste this link into your browser:<br>
                      <a href="${link}" style="color: #007bff; word-break: break-all;">${link}</a>
                    </p>
                    <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #999999;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                      © ${new Date().getFullYear()} SingFLEX. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `Click the link below to ${action}:\n\n${link}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

  return sendEmail({ to, subject, html, text });
};

export const generatePin = (): string => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[PIN_GENERATED] New 6-digit PIN: ${pin}`);
  return pin;
};
