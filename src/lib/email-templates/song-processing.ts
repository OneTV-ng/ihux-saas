/**
 * Email template for when a song starts processing after admin publishing
 */
export interface SongProcessingEmailData {
  userName: string;
  userEmail: string;
  songTitle: string;
  artistName: string;
  productCode: string;
  processingUrl?: string;
}

export function songProcessingEmailTemplate(data: SongProcessingEmailData) {
  const processingLink = data.processingUrl || 'https://singflex.com/desk/artist/songs';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Song Processing Started</title>
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
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #667eea;
            min-width: 120px;
        }
        .info-value {
            text-align: right;
            color: #333;
            word-break: break-word;
        }
        .product-code {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
        }
        .timeline {
            margin: 32px 0;
        }
        .timeline-item {
            display: flex;
            margin-bottom: 24px;
        }
        .timeline-marker {
            width: 40px;
            height: 40px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: 16px;
            flex-shrink: 0;
        }
        .timeline-content h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #333;
        }
        .timeline-content p {
            margin: 0;
            font-size: 14px;
            color: #666;
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
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 32px 0 16px 0;
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
            <h1>🎵 Processing Started!</h1>
            <p>Your song has entered the validation queue</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Hi <span class="highlight">${data.userName}</span>,</p>
                <p>Excellent news! Your song <span class="highlight">"${data.songTitle}"</span> has been published and is now entering our validation process. This is an important step before going live on the platform.</p>
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Song Title</span>
                    <span class="info-value">${data.songTitle}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Artist</span>
                    <span class="info-value">${data.artistName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Product Code</span>
                    <span class="info-value product-code">${data.productCode}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="info-value">📋 Processing</span>
                </div>
            </div>

            <div class="section-title">What Happens Next?</div>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-marker">1</div>
                    <div class="timeline-content">
                        <h3>Validation Phase (2-3 days)</h3>
                        <p>Our team will validate your song's metadata, audio quality, and compliance with platform guidelines.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker">2</div>
                    <div class="timeline-content">
                        <h3>You'll Receive Updates</h3>
                        <p>We'll send you email notifications when your song is approved or if we need any adjustments.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker">3</div>
                    <div class="timeline-content">
                        <h3>Go Live!</h3>
                        <p>Once approved, your song will be published and available to listeners worldwide.</p>
                    </div>
                </div>
            </div>

            <div class="section-title">Important Information</div>
            <ul style="color: #666; line-height: 1.8;">
                <li><strong>Product Code:</strong> Save this code <span class="product-code">${data.productCode}</span> for your records. You'll need it for future reference.</li>
                <li><strong>Tracking:</strong> Use your product code to track your song's progress through our system.</li>
                <li><strong>Estimated Timeline:</strong> Most songs are validated within 2-3 business days.</li>
                <li><strong>Need Help?</strong> Visit your dashboard to view detailed processing status or contact our support team.</li>
            </ul>

            <a href="${processingLink}" class="cta-button">Check Processing Status</a>
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
🎵 Processing Started!

Hi ${data.userName},

Excellent news! Your song "${data.songTitle}" has been published and is now entering our validation process.

SONG DETAILS
Song: ${data.songTitle}
Artist: ${data.artistName}
Product Code: ${data.productCode}
Status: Processing

WHAT HAPPENS NEXT
1. Our team will validate your song within 2-3 days
2. You'll receive email updates on the progress
3. Once approved, your song will go live on the platform

IMPORTANT
- Save your product code: ${data.productCode}
- Use it to track your song's progress
- Visit your dashboard for detailed status

Check your processing status: ${processingLink}

Questions? Contact our support team.

SingFLEX Global Music Hub
Empowering artists worldwide
  `.trim();

  return {
    subject: `🎵 Your Song "${data.songTitle}" is Now Processing - Product Code: ${data.productCode}`,
    html: htmlContent,
    text: plainTextContent,
  };
}
