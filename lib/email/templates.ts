type EmailMetricTone = "default" | "accent" | "warning";

type EmailMetric = {
  label: string;
  value: string;
  tone?: EmailMetricTone;
};

type EmailDetail = {
  label: string;
  value: string;
};

type EmailSection = {
  title: string;
  body: string;
  details?: EmailDetail[];
};

type BankEmailInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  recipientName: string;
  summary?: string;
  ctaLabel?: string;
  ctaHref?: string;
  metrics?: EmailMetric[];
  sections?: EmailSection[];
  footerNote?: string;
};

export type CommonEmailTemplate = {
  id: string;
  subject: string;
  previewText: string;
  html: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const hostedResetTemplateHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Bankjoy password</title>
  </head>
  <body style="margin:0;padding:0;background:#eef5fc;color:#112134;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Reset your Bankjoy password securely.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:
      radial-gradient(circle at top left, rgba(0,166,166,0.16), transparent 28%),
      radial-gradient(circle at top right, rgba(245,111,72,0.18), transparent 32%),
      linear-gradient(180deg, #fbf6f1 0%, #eef5fc 100%);
      padding:32px 16px;
    ">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#5d728b;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                  Bankjoy
                </div>
              </td>
            </tr>
            <tr>
              <td style="border-radius:34px;overflow:hidden;border:1px solid rgba(255,255,255,0.75);box-shadow:0 20px 60px rgba(17,33,52,0.10);">
                <div style="background:linear-gradient(135deg,#112134 0%,#1e3854 68%,#00a6a6 160%);padding:34px 32px;color:#ffffff;">
                  <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.58);font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                    Security
                  </div>
                  <div style="margin-top:16px;font-size:36px;line-height:1.12;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">
                    Reset your password
                  </div>
                  <div style="margin-top:16px;max-width:460px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.76);font-family:Arial,sans-serif;">
                    We received a request to reset the password for your Bankjoy profile.
                  </div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;">
                    <tr>
                      <td style="padding:0 6px 12px 0;" valign="top">
                        <div style="min-width:140px;border-radius:20px;padding:16px 18px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.10);">
                          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.62);font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                            Request
                          </div>
                          <div style="margin-top:10px;font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;font-family:'Space Grotesk',Arial,sans-serif;">
                            New
                          </div>
                        </div>
                      </td>
                      <td style="padding:0 6px 12px 6px;" valign="top">
                        <div style="min-width:140px;border-radius:20px;padding:16px 18px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.10);">
                          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.62);font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                            Channel
                          </div>
                          <div style="margin-top:10px;font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;font-family:'Space Grotesk',Arial,sans-serif;">
                            Email
                          </div>
                        </div>
                      </td>
                      <td style="padding:0 0 12px 6px;" valign="top">
                        <div style="min-width:140px;border-radius:20px;padding:16px 18px;background:rgba(245,111,72,0.14);border:1px solid rgba(255,255,255,0.10);">
                          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.62);font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                            Action
                          </div>
                          <div style="margin-top:10px;font-size:24px;line-height:1.2;font-weight:700;color:#ffd5ca;font-family:'Space Grotesk',Arial,sans-serif;">
                            Required
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="background:rgba(255,255,255,0.96);padding:30px 32px;">
                  <div style="font-size:15px;line-height:1.7;color:#112134;font-family:Arial,sans-serif;">
                    Hello,
                  </div>
                  <div style="margin-top:14px;font-size:15px;line-height:1.8;color:#5d728b;font-family:Arial,sans-serif;">
                    Use the secure link below to choose a new password. For your protection, this link should only be used if you requested a reset.
                  </div>
                  <div style="margin-top:28px;">
                    <a
                      href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}"
                      style="display:inline-block;border-radius:999px;background:#00a6a6;padding:14px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Space Grotesk',Arial,sans-serif;"
                    >
                      Reset password
                    </a>
                  </div>
                  <div style="margin-top:18px;border-radius:24px;border:1px solid #d6e2ef;background:#f8fbfe;padding:22px;">
                    <div style="font-size:13px;font-weight:700;color:#112134;font-family:'Space Grotesk',Arial,sans-serif;">
                      Did not request this?
                    </div>
                    <div style="margin-top:10px;font-size:14px;line-height:1.7;color:#5d728b;font-family:Arial,sans-serif;">
                      If you did not request a password reset, you can ignore this message. Your current password will remain unchanged.
                    </div>
                  </div>
                  <div style="margin-top:18px;border-radius:24px;border:1px solid #d6e2ef;background:#f8fbfe;padding:22px;">
                    <div style="font-size:13px;font-weight:700;color:#112134;font-family:'Space Grotesk',Arial,sans-serif;">
                      Security reminder
                    </div>
                    <div style="margin-top:10px;font-size:14px;line-height:1.7;color:#5d728b;font-family:Arial,sans-serif;">
                      After updating your password, review recent sign-in activity and update any reused credentials elsewhere.
                    </div>
                  </div>
                  <div style="margin-top:28px;border-top:1px solid #d6e2ef;padding-top:18px;font-size:13px;line-height:1.7;color:#6e8196;font-family:Arial,sans-serif;">
                    If you have questions about your account, contact Bankjoy support.
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 8px 0 8px;font-size:12px;line-height:1.7;color:#7f90a4;text-align:center;font-family:Arial,sans-serif;">
                Bankjoy, 100 Market Street, San Francisco, CA 94105
                <br />
                This message was sent regarding your digital banking relationship.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMetric(metric: EmailMetric) {
  const background =
    metric.tone === "accent"
      ? "rgba(0, 166, 166, 0.12)"
      : metric.tone === "warning"
        ? "rgba(245, 111, 72, 0.14)"
        : "rgba(255, 255, 255, 0.10)";

  const textColor = metric.tone === "warning" ? "#ffd5ca" : "#ffffff";

  return `
    <td style="padding:0 6px 12px 6px;" valign="top">
      <div style="min-width:140px;border-radius:20px;padding:16px 18px;background:${background};border:1px solid rgba(255,255,255,0.10);">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.62);font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
          ${escapeHtml(metric.label)}
        </div>
        <div style="margin-top:10px;font-size:24px;line-height:1.2;font-weight:700;color:${textColor};font-family:'Space Grotesk',Arial,sans-serif;">
          ${escapeHtml(metric.value)}
        </div>
      </div>
    </td>
  `;
}

function renderDetails(details: EmailDetail[]) {
  const rows = details
    .map(
      (detail) => `
        <tr>
          <td style="padding:0 0 8px 0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#6e8196;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
            ${escapeHtml(detail.label)}
          </td>
          <td style="padding:0 0 8px 16px;font-size:14px;line-height:1.6;color:#112134;text-align:right;font-family:Arial,sans-serif;">
            ${escapeHtml(detail.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">${rows}</table>`;
}

function renderSection(section: EmailSection) {
  return `
    <div style="margin-top:18px;border-radius:24px;border:1px solid #d6e2ef;background:#f8fbfe;padding:22px;">
      <div style="font-size:13px;font-weight:700;color:#112134;font-family:'Space Grotesk',Arial,sans-serif;">
        ${escapeHtml(section.title)}
      </div>
      <div style="margin-top:10px;font-size:14px;line-height:1.7;color:#5d728b;font-family:Arial,sans-serif;">
        ${escapeHtml(section.body)}
      </div>
      ${section.details && section.details.length > 0 ? renderDetails(section.details) : ""}
    </div>
  `;
}

export function renderBankEmail(input: BankEmailInput) {
  const metricRow =
    input.metrics && input.metrics.length > 0
      ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;">
          <tr>
            ${input.metrics.map((metric) => renderMetric(metric)).join("")}
          </tr>
        </table>
      `
      : "";

  const cta =
    input.ctaLabel && input.ctaHref
      ? `
        <div style="margin-top:28px;">
          <a
            href="${escapeHtml(input.ctaHref)}"
            style="display:inline-block;border-radius:999px;background:#00a6a6;padding:14px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Space Grotesk',Arial,sans-serif;"
          >
            ${escapeHtml(input.ctaLabel)}
          </a>
        </div>
      `
      : "";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(input.title)}</title>
      </head>
      <body style="margin:0;padding:0;background:#eef5fc;color:#112134;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${escapeHtml(input.preheader)}
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:
          radial-gradient(circle at top left, rgba(0,166,166,0.16), transparent 28%),
          radial-gradient(circle at top right, rgba(245,111,72,0.18), transparent 32%),
          linear-gradient(180deg, #fbf6f1 0%, #eef5fc 100%);
          padding:32px 16px;
        ">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#5d728b;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                      Bankjoy
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border-radius:34px;overflow:hidden;border:1px solid rgba(255,255,255,0.75);box-shadow:0 20px 60px rgba(17,33,52,0.10);">
                    <div style="background:linear-gradient(135deg,#112134 0%,#1e3854 68%,#00a6a6 160%);padding:34px 32px;color:#ffffff;">
                      <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.58);font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;">
                        ${escapeHtml(input.eyebrow)}
                      </div>
                      <div style="margin-top:16px;font-size:36px;line-height:1.12;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">
                        ${escapeHtml(input.title)}
                      </div>
                      <div style="margin-top:16px;max-width:460px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.76);font-family:Arial,sans-serif;">
                        ${escapeHtml(input.intro)}
                      </div>
                      ${metricRow}
                    </div>
                    <div style="background:rgba(255,255,255,0.96);padding:30px 32px;">
                      <div style="font-size:15px;line-height:1.7;color:#112134;font-family:Arial,sans-serif;">
                        Hello ${escapeHtml(input.recipientName)},
                      </div>
                      <div style="margin-top:14px;font-size:15px;line-height:1.8;color:#5d728b;font-family:Arial,sans-serif;">
                        ${escapeHtml(input.summary ?? input.intro)}
                      </div>
                      ${cta}
                      ${(input.sections ?? []).map((section) => renderSection(section)).join("")}
                      <div style="margin-top:28px;border-top:1px solid #d6e2ef;padding-top:18px;font-size:13px;line-height:1.7;color:#6e8196;font-family:Arial,sans-serif;">
                        ${escapeHtml(
                          input.footerNote ??
                            "If you have questions about your account, reply to this email or contact Bankjoy support.",
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 8px 0 8px;font-size:12px;line-height:1.7;color:#7f90a4;text-align:center;font-family:Arial,sans-serif;">
                    Bankjoy, 100 Market Street, San Francisco, CA 94105
                    <br />
                    This message was sent regarding your digital banking relationship.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getCommonEmailTemplates(): CommonEmailTemplate[] {
  return [
    {
      id: "welcome",
      subject: "Welcome to Bankjoy",
      previewText: "Your account is ready. Review balances, activity, and notifications in one place.",
      html: renderBankEmail({
        preheader: "Welcome to your new digital banking workspace.",
        eyebrow: "Account access",
        title: "Welcome to Bankjoy",
        intro: "Your digital banking profile is now active and ready for everyday account activity.",
        recipientName: "Avery Stone",
        summary:
          "You can now view balances, review recent transactions, move funds between eligible accounts, and monitor account notifications from one secure workspace.",
        ctaLabel: "Open your account",
        ctaHref: `${APP_URL}/dashboard`,
        metrics: [
          { label: "Access", value: "Active", tone: "accent" },
          { label: "Alerts", value: "Enabled" },
          { label: "Support", value: "24/7" },
        ],
        sections: [
          {
            title: "What you can do next",
            body: "Review your account summary, confirm your personal information, and turn on the alerts that matter most to you.",
          },
          {
            title: "Security reminder",
            body: "Protect your profile by using a unique password and reviewing activity alerts regularly.",
          },
        ],
      }),
    },
    {
      id: "password-reset",
      subject: "Reset your Bankjoy password",
      previewText: "A secure password reset was requested for your account.",
      html: renderBankEmail({
        preheader: "Reset your password securely.",
        eyebrow: "Security",
        title: "Reset your password",
        intro: "We received a request to reset the password for your Bankjoy profile.",
        recipientName: "Avery Stone",
        summary:
          "Use the secure link below to choose a new password. For your protection, this link should only be used if you requested a reset.",
        ctaLabel: "Reset password",
        ctaHref: `${APP_URL}/reset-password`,
        metrics: [
          { label: "Request", value: "New" },
          { label: "Channel", value: "Email" },
          { label: "Action", value: "Required", tone: "warning" },
        ],
        sections: [
          {
            title: "Did not request this?",
            body: "If you did not request a password reset, you can ignore this message. Your current password will remain unchanged.",
          },
          {
            title: "Keep your account secure",
            body: "After updating your password, review recent sign-in activity and update any reused credentials elsewhere.",
          },
        ],
      }),
    },
    {
      id: "transfer-posted",
      subject: "Your transfer has been completed",
      previewText: "Funds were moved successfully between your eligible accounts.",
      html: renderBankEmail({
        preheader: "A transfer has posted to your account.",
        eyebrow: "Transfer activity",
        title: "Transfer completed",
        intro: "Your recent transfer has been processed successfully.",
        recipientName: "Jordan Ellis",
        summary:
          "The funds have been reflected in your eligible accounts and the transaction history has been updated.",
        ctaLabel: "Review transfer history",
        ctaHref: `${APP_URL}/dashboard/transfers`,
        metrics: [
          { label: "Amount", value: "$250.00", tone: "accent" },
          { label: "Status", value: "Completed" },
          { label: "Reference", value: "TRF-2048" },
        ],
        sections: [
          {
            title: "Transfer details",
            body: "Funds moved from Primary Checking to Reserve Savings.",
            details: [
              { label: "From", value: "Primary Checking •••• 4185" },
              { label: "To", value: "Reserve Savings •••• 2251" },
              { label: "Memo", value: "Monthly savings" },
              { label: "Posted", value: "Mar 14, 2026 at 12:08 PM" },
            ],
          },
        ],
      }),
    },
    {
      id: "security-alert",
      subject: "New sign-in to your Bankjoy account",
      previewText: "We noticed a new sign-in and want you to confirm it was you.",
      html: renderBankEmail({
        preheader: "A new sign-in was detected on your account.",
        eyebrow: "Security alert",
        title: "New sign-in detected",
        intro: "We noticed a new sign-in to your account and wanted to make sure it was you.",
        recipientName: "Jordan Ellis",
        summary:
          "If you recognize this activity, no further action is needed. If not, reset your password immediately and review your recent account activity.",
        ctaLabel: "Review account security",
        ctaHref: `${APP_URL}/dashboard`,
        metrics: [
          { label: "Device", value: "Chrome" },
          { label: "Location", value: "Chicago, IL" },
          { label: "Risk", value: "Review", tone: "warning" },
        ],
        sections: [
          {
            title: "Sign-in details",
            body: "This activity was recorded as a new browser session.",
            details: [
              { label: "Time", value: "Mar 14, 2026 at 6:07 AM" },
              { label: "IP address", value: "172.16.14.22" },
              { label: "Browser", value: "Chrome on macOS" },
            ],
          },
        ],
      }),
    },
    {
      id: "statement-ready",
      subject: "Your monthly statement is ready",
      previewText: "Your latest account statement is available to review.",
      html: renderBankEmail({
        preheader: "A new monthly statement is available.",
        eyebrow: "Documents",
        title: "Statement ready",
        intro: "Your latest monthly statement is now available in digital banking.",
        recipientName: "Avery Stone",
        summary:
          "Review your statement to confirm balances, posted transactions, and any service notices related to your account.",
        ctaLabel: "View statement",
        ctaHref: `${APP_URL}/dashboard`,
        metrics: [
          { label: "Period", value: "Feb 2026" },
          { label: "Format", value: "PDF" },
          { label: "Status", value: "Available", tone: "accent" },
        ],
        sections: [
          {
            title: "Included in this statement",
            body: "Opening and closing balances, posted transactions, transfer activity, and account notices for the statement period.",
          },
        ],
      }),
    },
  ];
}
