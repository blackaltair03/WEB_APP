import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateVerificationCode, storeVerificationCode, getFailedAttempts } from "@/lib/redis";
import { sendVerificationCodeEmail } from "@/lib/email";

/**
 * POST /api/auth/verification/send
 * Envía un código de verificación al email del usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email es requerido" },
        { status: 400 }
      );
    }

    // Buscar el usuario en la base de datos
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibirás un código de verificación",
      });
    }

    if (!user.activo) {
      return NextResponse.json(
        { success: false, message: "Tu cuenta está desactivada. Contacta al administrador." },
        { status: 403 }
      );
    }

    // Verificar intentos fallidos
    const failedAttempts = await getFailedAttempts(email);
    if (failedAttempts >= 5) {
      return NextResponse.json(
        { success: false, message: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
        { status: 429 }
      );
    }

    // Generar código de 5 dígitos
    const code = generateVerificationCode();

    // Almacenar en Redis (expira en 5 minutos)
    await storeVerificationCode(email, code, 300);

    // Enviar email con el código
    try {
      await sendVerificationCodeEmail({
        email,
        code,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // En desarrollo, retornamos el código para pruebas
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "Código enviado (development mode)",
          devCode: code, // Solo en desarrollo
        });
      }
      return NextResponse.json(
        { success: false, message: "Error al enviar el código. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código de verificación enviado",
    });
  } catch (error) {
    console.error("Error in send verification:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
