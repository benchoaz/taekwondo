import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  title: string;
  message: string;
  link?: string;
}

/**
 * Utility to send notification email via Nodemailer.
 * Ignores dummy/placeholder emails ending in .local
 */
export async function sendNotificationEmail({ to, subject, title, message, link }: SendEmailOptions) {
  if (!to || to.endsWith(".local") || !to.includes("@")) {
    return;
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log(`[EMAIL_SKIPPED] SMTP credentials not set. Would have sent email to ${to}: "${title}"`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://whitetigerkraksaan.com";
  const targetUrl = `${baseUrl}/`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #E10600; padding: 20px 24px; text-align: center;">
          <h2 style="color: #FFFFFF; margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: 800;">
            WHITE TIGER TAEKWONDO
          </h2>
          <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0 0; font-size: 11px; font-weight: 600;">
            NOTIFIKASI INFORMASI & TAGIHAN
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h3 style="color: #0F172A; font-size: 18px; margin-top: 0; margin-bottom: 16px;">
            ${title}
          </h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px; white-space: pre-line;">
            ${message}
          </p>

          ${link ? `
            <div style="margin-top: 24px; text-align: center;">
              <a href="${targetUrl}" style="background-color: #E10600; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;">
                Buka Aplikasi Web
              </a>
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #F1F5F9; padding: 16px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="color: #94A3B8; font-size: 11px; margin: 0;">
            Email ini dikirimkan secara otomatis dari sistem White Tiger Taekwondo Academy Kraksaan.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Clean emojis from subject to reduce spam score
  const cleanSubject = subject.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, "").trim();

  // Create plain text fallback (crucial for Gmail spam filters)
  const plainTextContent = `${title}\n\n${message}\n\nBuka aplikasi: ${targetUrl}\n\n---\nWhite Tiger Taekwondo Academy Kraksaan`;

  try {
    await transporter.sendMail({
      from: `"White Tiger Taekwondo" <${smtpUser}>`,
      to,
      replyTo: smtpUser,
      subject: `[White Tiger] ${cleanSubject}`,
      text: plainTextContent,
      html: htmlContent,
    });
    console.log(`[EMAIL_SENT] Email successfully sent to ${to}`);
  } catch (err: any) {
    console.error(`[EMAIL_ERROR] Failed to send email to ${to}:`, err.message);
  }
}

