import { Logger } from "@nestjs/common";
import { Resend } from "resend";
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

  const resend = new Resend(process.env.RESEND);
  await resend.emails.send({
    from: "Docentes Primera Infancia <anriverax@codear.dev>",
    to: [to],
    subject,
    html
  });
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
    <div style="background-color:#FFFFFF;border-radius:8px;margin:0 auto;border:1px solid #E5E7EB;box-shadow:0 1px 3px rgba(0, 0, 0, 0.1);max-width:600px;padding:24px 42px">
      <section style="display:flex;padding:20px 0;align-items:center;justify-content:center">
        <img
          src="https://res.cloudinary.com/dwdju8gzi/image/upload/v1744236682/jxsww3efugwnggetyqfq.png"
          width="100%"
          height="auto"
          alt="cintillo logo"
        />
      </section>
      <h2 style="font-size:24px;line-height:32px;margin-bottom:16px">${subject}</h2>
      <section style="margin: 12px 0 24px 0">
        <p style="font-weight: bold; text-align: center;">Tu código de verificación es:</p>
        <p style="height: 100%; width: 100%; padding: 20px 0; background-color: #4f46e5; color: #FFFFFF; border-radius: 8px; font-weight: bold; font-size: 36px; margin: 10px 0; text-align: center">${otp}</p>
        <p style="margin: 0px; text-align: center; font-size: 14px; color: #6b7280">Este código expira en 10 minutos. No lo compartas con nadie.</p>
        <p style="margin: 0px; text-align: center; font-size: 14px; color: #6b7280">Si no has solicitado la creación de una cuenta, puedes ignorar este mensaje de forma segura.</p>
      </section>
      <section style="margin: 12px 0 24px 0">
        <hr/>
        <p style="color: #6b7280;font-size: 12px;font-weight: 500;margin: 30px 0 0 0;text-align: center">Por tu seguridad, nunca te solicitaremos a través de correo electrónico que compartas tu
              contraseña, datos de tarjeta de crédito o información bancaria.</p>
      </section>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
