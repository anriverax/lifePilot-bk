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
    from: "Life Pilot <anriverax@codear.dev>",
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

  const contentByType: Record<
    typeof type,
    {
      title: string;
      intro: string;
      otpLabel: string;
      ignoreMessage: string;
    }
  > = {
    "sign-in": {
      title: "Confirma tu inicio de sesión",
      intro:
        'Ingresa el siguiente código en la aplicación para completar el acceso a tu cuenta de <strong style="color:#111827;">Docentes Primera Infancia</strong>.',
      otpLabel: "Tu código de acceso",
      ignoreMessage: "Si no intentaste iniciar sesión, puedes ignorar este mensaje de forma segura."
    },
    "email-verification": {
      title: "Verifica tu dirección de correo",
      intro:
        'Ingresa el siguiente código en la aplicación para confirmar tu cuenta de <strong style="color:#111827;">Docentes Primera Infancia</strong>.',
      otpLabel: "Tu código de verificación",
      ignoreMessage:
        "Si no solicitaste la creación de una cuenta, puedes ignorar este mensaje de forma segura."
    },
    "forget-password": {
      title: "Restablece tu contraseña",
      intro:
        'Ingresa el siguiente código en la aplicación para continuar con el restablecimiento de tu contraseña en <strong style="color:#111827;">Docentes Primera Infancia</strong>.',
      otpLabel: "Tu código de recuperación",
      ignoreMessage:
        "Si no solicitaste cambiar tu contraseña, puedes ignorar este mensaje de forma segura."
    },
    "change-email": {
      title: "Confirma tu nueva dirección de correo",
      intro:
        'Ingresa el siguiente código en la aplicación para confirmar el cambio de correo en <strong style="color:#111827;">Docentes Primera Infancia</strong>.',
      otpLabel: "Tu código de confirmación",
      ignoreMessage: "Si no solicitaste cambiar tu correo, puedes ignorar este mensaje de forma segura."
    }
  };

  const subject = subjects[type];
  const content = contentByType[type];
  const html = `
    <div>
      <!-- Wrapper -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6; padding:32px 16px;">
        <tr>
          <td align="center">
            <!-- Card container -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
              <!-- ======================== LOGO BAR ======================== -->
              <tr>
                <td style="padding:28px 40px 20px; border-bottom:1px solid #e5e7eb;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <!-- Logo MINED -->
                      <td width="42%" style="vertical-align:middle; padding-right:12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="vertical-align:middle; padding-right:8px;">
                              <div style="width:36px; height:36px; background-color:#1e3a8a; border-radius:4px; text-align:center; line-height:36px;">
                                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:11px; font-weight:900; color:#ffffff;">SV</span>
                              </div>
                            </td>
                            <td style="vertical-align:middle;">
                              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:8.5px; font-weight:700; color:#111827; text-transform:uppercase; letter-spacing:0.02em; line-height:1.4; display:block;">
                                Ministerio de Educación<br>Ciencia y Tecnología
                              </span>
                              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:8px; color:#6b7280; display:block; line-height:1.3;">
                                Gobierno de El Salvador
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <!-- Logo IL3 -->
                      <td width="42%" style="vertical-align:middle; padding-right:12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="vertical-align:middle; padding-right:8px;">
                              <div style="width:36px; height:36px; background-color:#0f6e56;border-radius:4px; text-align:center; line-height:36px;">
                                <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px; font-weight:900; color:#ffffff;">IL3</span>
                              </div>
                            </td>
                            <td style="vertical-align:middle;">
                              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8.5px; font-weight:700; color:#111827;text-transform:uppercase; letter-spacing:0.02em;line-height:1.4; display:block;">
                                Institut de Formació<br>Contínua – IL3
                              </span>
                              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:8px; color:#6b7280; display:block; line-height:1.3;">
                                Universitat de Barcelona
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <!-- Logo OEI -->
                      <td width="16%" style="vertical-align:middle; text-align:right;">
                        <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:22px; font-weight:900; color:#1d4ed8; letter-spacing:-1px;">OEI</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- ======================== EMAIL BODY ======================== -->
              <tr>
                <td style="padding:48px 40px 40px; text-align:center;">
                  <!-- Ícono sobre -->
                  <div style="width:56px; height:56px; background-color:#eef2ff; border-radius:28px; margin:0 auto 24px; text-align:center; line-height:56px;">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; margin-top:14px;" aria-hidden="true">
                      <rect x="3" y="7" width="22" height="15" rx="3" stroke="#4f46e5" stroke-width="1.8"/>
                      <path d="M3 10l11 7 11-7" stroke="#4f46e5" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <!-- Título -->
                  <h1 style="font-family:Georgia,'Times New Roman',Times,serif; font-size:26px; font-weight:700; color:#111827; margin:0 0 12px; line-height:1.25;">
                    ${content.title}
                  </h1>
                  <!-- Saludo -->
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:15px; color:#374151; margin:0 0 32px; line-height:1.65;">
                    Hola,<br>
                    ${content.intro}
                  </p>
                  <!-- Label OTP -->
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">
                    ${content.otpLabel}
                  </p>
                  <!-- OTP Block -->
                  <div role="region" aria-label="Código de verificación de 6 dígitos" style="background-color:#4f46e5; border-radius:8px; padding:28px 40px; margin:0 auto 20px; max-width:460px;">
                    <p style="font-family:'Courier New','Lucida Console',Courier,monospace; font-size:42px; font-weight:700; color:#ffffff; letter-spacing:14px; text-indent:14px; margin:0; line-height:1;">
                      ${otp}
                    </p>
                  </div>
                  <!-- Expiry Badge -->
                  <div style="margin-bottom:20px;">
                    <span style="display:inline-block; background-color:#fef3c7; border:1px solid #fcd34d; border-radius:20px; padding:6px 16px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12.5px; color:#92400e; font-weight:500;">
                      &#x23F1;&nbsp;&nbsp;Expira en 10 minutos
                    </span>
                  </div>
                  <!-- Advertencia 1 -->
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; color:#6b7280; line-height:1.7;margin:0 auto 8px; max-width:420px;">
                    No compartas este código con nadie, incluso si dice ser parte de nuestro equipo de soporte.
                  </p>
                  <!-- Advertencia 2 -->
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; color:#6b7280; line-height:1.7; margin:0 auto; max-width:420px;">
                    ${content.ignoreMessage}
                  </p>
                  <!-- Divider -->
                  <div style="border-top:1px solid #e5e7eb; margin:32px 0;"></div>
                  <!-- Ícono candado -->
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:0 auto 8px;" aria-hidden="true">
                    <rect x="3" y="7" width="10" height="7" rx="2" stroke="#d1d5db" stroke-width="1.3"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="#d1d5db" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                  <!-- Texto de seguridad -->
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; color:#9ca3af; line-height:1.7; max-width:420px; margin:0 auto;">
                    Por tu seguridad, nunca te solicitaremos a través de correo electrónico que compartas
                    tu contraseña, datos de tarjeta de crédito o información bancaria.
                  </p>
                </td>
              </tr>
              <!-- ======================== FOOTER BAR ======================== -->
              <tr>
                <td style="background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:16px 40px; text-align:center;">
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:11px; color:#9ca3af; margin:0; line-height:1.6;">
                    &copy; 2025 Docentes Primera Infancia &nbsp;&middot;&nbsp;
                    Este es un correo automático, por favor no respondas a este mensaje.<br>
                    Ministerio de Educación, Ciencia y Tecnología &middot; El Salvador
                  </p>
                </td>
              </tr>
            </table>
            <!-- /Card container -->
          </td>
        </tr>
      </table>
      <!-- /Wrapper -->
    </div>
  `;

  await sendEmail({ to, subject, html });
}
