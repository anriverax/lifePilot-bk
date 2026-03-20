import { Logger } from "@nestjs/common";

const logger = new Logger("EmailService");

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email via the Resend REST API.
 *
 * Required environment variables:
 *   RESEND      — Resend API key (sk_...)
 *   EMAIL_FROM  — Sender address (e.g. noreply@yourdomain.com) — defaults to noreply@lifepilot.app
 *
 * If RESEND is not set the function logs a warning and returns without error so that
 * local development works without a real email provider.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND;

  if (!apiKey) {
    logger.warn(`[EMAIL SKIPPED – RESEND not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "noreply@lifepilot.app";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [to], subject, html })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }
}

/** Convenience wrapper for OTP emails. */
export async function sendOTPEmail({
  to,
  otp,
  type
}: {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}): Promise<void> {
  const subjects: Record<typeof type, string> = {
    "sign-in": "Tu código de inicio de sesión",
    "email-verification": "Verifica tu dirección de correo",
    "forget-password": "Restablece tu contraseña",
    "change-email": "Confirma tu nueva dirección de correo"
  };

  const subject = subjects[type];
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>${subject}</h2>
      <p>Tu código de verificación es:</p>
      <p style="font-size:2rem;font-weight:bold;letter-spacing:0.25em">${otp}</p>
      <p>Este código expira en 10 minutos. No lo compartas con nadie.</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
