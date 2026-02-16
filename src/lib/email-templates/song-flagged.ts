/**
 * Email template for when a song is flagged with issues
 */
export interface SongFlaggedEmailData {
  userName: string;
  songTitle: string;
  categories: string[];
  reason: string;
  songId: string;
  detailsUrl?: string;
}

export function songFlaggedEmailTemplate(data: SongFlaggedEmailData) {
  const detailsLink = data.detailsUrl || `https://singflex.com/desk/artist/songs/${data.songId}`;

  // Map category names to display text
  const categoryMap: Record<string, string> = {
    copyright: '⚖️ Copyright Issues',
    names: '🏷️ Artist/Song Name Issues',
    cover: '🖼️ Album Cover Issues',
    song_issues: '🎵 General Song Issues',
  };

  const categoryDisplay = data.categories
    .map((cat) => categoryMap[cat] || cat)
    .join('<br>');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Song Needs Attention</title>
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        .alert-box {
            background: #fff7ed;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .alert-box h2 {
            margin: 0 0 12px 0;
            color: #d97706;
            font-size: 16px;
        }
        .categories {
            background: #fffbf0;
            padding: 12px;
            border-radius: 4px;
            margin: 12px 0;
            font-size: 14px;
            line-height: 1.8;
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
        .next-steps {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .next-steps h3 {
            margin: 0 0 12px 0;
            color: #059669;
            font-size: 16px;
        }
        .next-steps ol {
            margin: 0;
            padding-left: 20px;
            color: #555;
        }
        .next-steps li {
            margin-bottom: 8px;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 24px;
            text-align: center;
        }
        .cta-button:hover {
            opacity: 0.9;
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
            <h1>⚠️ Your Song Needs Attention</h1>
            <p>Action required before publication</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Hi <span class="highlight">${data.userName}</span>,</p>
                <p>We've reviewed your song <span class="highlight">"${data.songTitle}"</span> and found some issues that need to be addressed before we can publish it. The good news is that these are fixable!</p>
            </div>

            <div class="alert-box">
                <h2>Issues Found</h2>
                <div class="categories">
                    ${categoryDisplay}
                </div>
            </div>

            <div class="reason-box">
                <div class="reason-label">Details:</div>
                <div class="reason-text">${data.reason}</div>
            </div>

            <div class="section-title">What You Need To Do</div>
            <div class="next-steps">
                <h3>✅ Fix and Resubmit</h3>
                <ol>
                    <li>Review the issues listed above carefully</li>
                    <li>Make the necessary corrections to your song or metadata</li>
                    <li>Log in to your dashboard to update your song</li>
                    <li>Resubmit your song for review</li>
                </ol>
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 600;">📌 Need Help?</p>
                <p style="margin: 0; color: #555; font-size: 14px;">If you have questions about these issues or need assistance fixing them, don't hesitate to contact our support team. We're here to help!</p>
            </div>

            <a href="${detailsLink}" class="cta-button">View Song Details & Update</a>
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
⚠️ Your Song Needs Attention

Hi ${data.userName},

We've reviewed your song "${data.songTitle}" and found some issues that need to be addressed before publication.

ISSUES FOUND
${data.categories.map((cat) => `- ${categoryMap[cat] || cat}`).join('\n')}

DETAILS
${data.reason}

WHAT YOU NEED TO DO
1. Review the issues listed above
2. Make the necessary corrections
3. Log in to your dashboard to update your song
4. Resubmit your song for review

NEED HELP?
If you have questions about these issues, contact our support team.

View and Update Your Song: ${detailsLink}

SingFLEX Global Music Hub
Empowering artists worldwide
  `.trim();

  return {
    subject: `⚠️ Your Song "${data.songTitle}" Needs Attention`,
    html: htmlContent,
    text: plainTextContent,
  };
}
