import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// Estilos compartidos de email (colores institucionales)
const headerStyle = `background:#621132; padding:28px 32px;`;
const footerStyle = `background:#f3f4f6; padding:16px 32px; text-align:center;`;
const bodyStyle = `font-family: Montserrat, sans-serif; background:#f9fafb; padding:40px;`;
const cardStyle = `max-width:520px; margin:0 auto; background:#fff;
                     border-radius:8px; overflow:hidden;
                     box-shadow:0 2px 8px rgba(0,0,0,0.08);`;

// ── Reset de contraseña por email ──────────────────────────────────────
export async function sendPasswordResetEmail(params: {
  email: string;
  nombre: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/reset-password/${params.token}`;

  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Recuperación de contraseña — SADERH",
    html: `<!DOCTYPE html><html><body style="${bodyStyle}">
      <div style="${cardStyle}">
        <div style="${headerStyle}">
          <p style="color:#b38e5d;font-size:11px;margin:0 0 4px;
                    letter-spacing:2px;text-transform:uppercase;">
            Gobierno del Estado de Hidalgo
          </p>
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">SADERH</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#111827;font-size:15px;margin:0 0 12px;">
            Hola, <strong>${params.nombre}</strong>
          </p>
          <p style="color:#4b5563;font-size:14px;line-height:1.6;">
            Recibimos una solicitud para restablecer tu contraseña.
            El enlace es válido por <strong>2 horas</strong>.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}"
               style="background:#621132;color:#fff;padding:14px 32px;
                      border-radius:6px;text-decoration:none;
                      font-size:14px;font-weight:600;display:inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;line-height:1.6;">
            Si no solicitaste este cambio, ignora este correo.<br><br>
            O copia este enlace:<br>
            <span style="color:#621132;word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
        <div style="${footerStyle}">
          <p style="color:#9ca3af;font-size:11px;margin:0;">
            SADERH · Secretaría de Agricultura de Hidalgo
          </p>
        </div>
      </div>
    </body></html>`,
  });
}

// ── Email de bienvenida para alta de emergencia ────────────────────────
export async function sendWelcomeAdminEmail(params: {
  email: string;
  nombre: string;
  passwordTemporal: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Cuenta de administrador creada — SADERH",
    html: `<!DOCTYPE html><html><body style="${bodyStyle}">
      <div style="${cardStyle}">
        <div style="${headerStyle}">
          <p style="color:#b38e5d;font-size:11px;margin:0 0 4px;
                    letter-spacing:2px;text-transform:uppercase;">
            Gobierno del Estado de Hidalgo
          </p>
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">
            Cuenta Creada — SADERH
          </h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#111827;font-size:15px;margin:0 0 12px;">
            Hola, <strong>${params.nombre}</strong>
          </p>
          <p style="color:#4b5563;font-size:14px;line-height:1.6;">
            Tu cuenta de <strong>Super Administrador</strong> ha sido creada en SADERH.
          </p>
          <div style="background:#fff5f7;border:1px solid #f3c8d5;
                      border-radius:6px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0 0 8px;color:#4b5563;font-size:13px;">
              <strong>Email:</strong> ${params.email}
            </p>
            <p style="margin:0;color:#4b5563;font-size:13px;">
              <strong>Contraseña temporal:</strong>
              <code style="background:#f3f4f6;padding:2px 8px;
                           border-radius:4px;font-size:13px;">
                ${params.passwordTemporal}
              </code>
            </p>
          </div>
          <p style="color:#dc2626;font-size:13px;font-weight:600;">
            ⚠️ Cambia tu contraseña inmediatamente al ingresar.
          </p>
        </div>
        <div style="${footerStyle}">
          <p style="color:#9ca3af;font-size:11px;margin:0;">
            SADERH · Secretaría de Agricultura de Hidalgo
          </p>
        </div>
      </div>
    </body></html>`,
  });
}
