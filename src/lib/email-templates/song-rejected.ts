/**
 * Email template for when a song submission is rejected
 */
export interface SongRejectedEmailData {
  userName: string;
  songTitle: string;
  reason: string;
  songId: string;
  guidesUrl?: string;
  supportUrl?: string;
}

export function songRejectedEmailTemplate(data: SongRejectedEmailData) {
  const guidesLink = data.guidesUrl || 'https://singflex.com/help/submission-guidelines';
  const supportLink = data.supportUrl || 'https://singflex.com/support/contact';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Song Submission Rejected</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 24px;
            color: #333;
        }
        .rejection-box {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .rejection-box h2 {
            margin: 0 0 12px 0;
            color: #991b1b;
            font-size: 16px;
        }
        .reason-box {
            background: #f8f9fa;
            border-left: 4px solid #6b7280;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .reason-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .reason-text {
            color: #555;
            font-size: 14px;
            line-height: 1.6;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 32px 0 16px 0;
        }
        .options {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .options h3 {
            margin: 0 0 12px 0;
            color: #059669;
            font-size: 16px;
        }
        .options ul {
            margin: 0;
            padding-left: 20px;
            color: #555;
        }
        .options li {
            margin-bottom: 8px;
            font-size: 14px;
        }
        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            flex-wrap: wrap;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            flex-grow: 1;
            min-width: 150px;
        }
        .secondary-button {
            display: inline-block;
            background: #e5e7eb;
            color: #374151;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            flex-grow: 1;
            min-width: 150px;
        }
        .cta-button:hover,
        .secondary-button:hover {
            opacity: 0.9;
        }
        .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 0;
            color: #555;
            font-size: 14px;
            line-height: 1.6;
        }
        .info-box strong {
            color: #1e40af;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 4px 0;
        }
        .highlight {
            background: #fffbea;
            padding: 1px 4px;
            border-radius: 2px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Submission Rejected</h1>
            <p>Unfortunately, we cannot publish this submission</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Hi <span class="highlight">${data.userName}</span>,</p>
                <p>We've completed our review of your submission <span class="highlight">"${data.songTitle}"</span> and unfortunately we are unable to publish it at this time.</p>
            </div>

            <div class="rejection-box">
                <h2>❌ Rejection Notice</h2>
                <p style="margin: 0; color: #555;">Your song submission has been rejected and cannot be published on our platform.</p>
            </div>

            <div class="reason-box">
                <div class="reason-label">Reason for Rejection:</div>
                <div class="reason-text">${data.reason}</div>
            </div>

            <div class="section-title">What You Can Do</div>
            <div class="options">
                <h3>Your Options</h3>
                <ul>
                    <li><strong>Review Our Guidelines:</strong> Check our submission guidelines to understand platform requirements</li>
                    <li><strong>Contact Support:</strong> Reach out to our team if you'd like to discuss the rejection</li>
                    <li><strong>Submit a New Song:</strong> You can submit different songs that meet our guidelines</li>
                </ul>
            </div>

            <div class="info-box">
                <p><strong>Note:</strong> Rejection decisions are final, but we encourage you to review our submission guidelines and try submitting new content that aligns with our platform standards. We're always happy to help your music reach audiences!</p>
            </div>

            <div class="button-group">
                <a href="${guidesLink}" class="secondary-button">Review Guidelines</a>
                <a href="${supportLink}" class="secondary-button">Contact Support</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>SingFLEX Global Music Hub</strong></p>
            <p>Empowering artists worldwide | 🌍 Global Distribution Platform</p>
            <p>© ${new Date().getFullYear()} SingFLEX. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();

  const plainTextContent = `
❌ Submission Rejected

Hi ${data.userName},

We've completed our review of your submission "${data.songTitle}" and unfortunately we are unable to publish it.

REJECTION NOTICE
Your song submission has been rejected and cannot be published on our platform.

REASON FOR REJECTION
${data.reason}

WHAT YOU CAN DO
1. Review our submission guidelines to understand platform requirements
2. Contact our support team if you'd like to discuss the rejection
3. Submit different songs that meet our guidelines

Note: You can submit other songs that align with our platform standards.

Review Guidelines: ${guidesLink}
Contact Support: ${supportLink}

SingFLEX Global Music Hub
Empowering artists worldwide
  `.trim();

  return {
    subject: `❌ Your Song "${data.songTitle}" Submission Was Rejected`,
    html: htmlContent,
    text: plainTextContent,
  };
}
