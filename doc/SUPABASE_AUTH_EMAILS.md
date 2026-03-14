# Supabase Auth Email Templates

Use the following template in the Supabase Dashboard under `Auth -> Email Templates -> Reset Password`.

```html
<!doctype html>
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
</html>
```

Why this is required:
- The SSR app uses a server-side confirmation route to verify `token_hash` and write the recovery session into cookies.
- This avoids client-side PKCE verifier errors on password recovery links.
- The default Supabase recovery template will continue to send the old flow until this HTML is pasted into the hosted project template.
