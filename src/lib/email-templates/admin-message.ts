/**
 * Email template for custom admin messages sent to users
 */
export interface AdminMessageEmailData {
  userName: string;
  senderName: string;
  subject: string;
  message: string;
  messageUrl?: string;
}

export function adminMessageEmailTemplate(data: AdminMessageEmailData) {
  const messageLink = data.messageUrl || 'https://singflex.com/desk/notifications';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
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
        .message-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 24px;
            margin: 24px 0;
            border-radius: 4px;
            line-height: 1.8;
        }
        .message-box p {
            margin: 0 0 16px 0;
            color: #333;
        }
        .message-box p:last-child {
            margin-bottom: 0;
        }
        .message-box ul,
        .message-box ol {
            margin: 16px 0;
            padding-left: 24px;
            color: #333;
        }
        .message-box li {
            margin-bottom: 8px;
        }
        .message-box strong {
            color: #667eea;
            font-weight: 600;
        }
        .sender-info {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
            font-size: 14px;
        }
        .sender-info p {
            margin: 0;
            color: #1e40af;
        }
        .sender-info strong {
            color: #1e40af;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            <h1>📬 New Message from SingFLEX</h1>
            <p>You have a message from the SingFLEX team</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Hi <span class="highlight">${data.userName}</span>,</p>
                <p>You have received a message from the SingFLEX team.</p>
            </div>

            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #d97706; font-weight: 600; font-size: 16px;">${data.subject}</p>
            </div>

            <div class="message-box">
                ${data.message
                  .split('\n\n')
                  .map((para) => {
                    // Handle lists in the message
                    if (para.match(/^[-•*]\s/m)) {
                      const items = para
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((item) => `<li>${item.replace(/^[-•*]\s/, '')}</li>`)
                        .join('');
                      return `<ul style="margin: 16px 0; padding-left: 24px;">${items}</ul>`;
                    }
                    return `<p>${para}</p>`;
                  })
                  .join('')}
            </div>

            <div class="sender-info">
                <p><strong>From:</strong> ${data.senderName}</p>
                <p><strong>Team:</strong> SingFLEX Global Music Hub</p>
            </div>

            <a href="${messageLink}" class="cta-button">View in Dashboard</a>
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
📬 New Message from SingFLEX

Hi ${data.userName},

You have received a message from the SingFLEX team.

SUBJECT
${data.subject}

MESSAGE
${data.message}

From: ${data.senderName}
Team: SingFLEX Global Music Hub

View in Dashboard: ${messageLink}

SingFLEX Global Music Hub
Empowering artists worldwide
  `.trim();

  return {
    subject: `📬 Message from SingFLEX: ${data.subject}`,
    html: htmlContent,
    text: plainTextContent,
  };
}
