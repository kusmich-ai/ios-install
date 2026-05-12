// lib/emails/_shared.ts
// Shared HTML building blocks used by both nurture-templates.ts (post-Stage-1
// upgrade sequence) and lapsed-templates.ts (active-lapse retention sequence).
// Functions are copied verbatim from the original nurture-templates.ts so the
// rendered output remains pixel-identical to what's been deployed.

export function baseWrapper(content: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unbecoming</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / wordmark -->
          <tr>
            <td style="padding-bottom:40px;">
              <span style="font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ff9e19;">UNBECOMING</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:#333;line-height:1.6;">
                You're receiving this because you're in Stage 1 of The Stack.
              </p>
              <p style="margin:0;font-size:11px;color:#333;">
                <a href="${unsubscribeUrl}" style="color:#444;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background:#ff9e19;border-radius:10px;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#000;text-decoration:none;letter-spacing:0.02em;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #1a1a1a;margin:28px 0;" />`;
}
