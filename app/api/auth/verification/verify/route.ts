import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyCode, getFailedAttempts, incrementFailedAttempts, resetFailedAttempts } from "@/lib/redis";
import { sign } from "jsonwebtoken";

/**
 * POST /api/auth/verification/verify
 * Verifica el código y retorna el token de sesión
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email y código son requeridos" },
        { status: 400 }
      );
    }

    if (code.length !== 5 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Código inválido" },
        { status: 400 }
      );
    }

    // Verificar intentos fallidos
    const failedAttempts = await getFailedAttempts(email);
    if (failedAttempts >= 5) {
      return NextResponse.json(
        { success: false, message: "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos." },
        { status: 429 }
      );
    }

    // Verificar el código
    const isValid = await verifyCode(email, code);

    if (!isValid) {
      // Incrementar intentos fallidos
      await incrementFailedAttempts(email);
      const attemptsLeft = 4 - failedAttempts;
      
      return NextResponse.json(
        { 
          success: false, 
          message: attemptsLeft > 0 
            ? `Código incorrecto. Te quedan ${attemptsLeft} intentos.`
            : "Código incorrecto. Has excedido el límite de intentos." 
        },
        { status: 401 }
      );
    }

    // Resetear intentos fallidos
    await resetFailedAttempts(email);

    // Buscar el usuario en la base de datos
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { success: false, message: "Tu cuenta está desactivada" },
        { status: 403 }
      );
    }

    // Generar token JWT
    const token = sign(
      {
        userId: user.id_usuario,
        email: user.email,
        rol: user.rol,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Configurar cookie
    const response = NextResponse.json({
      success: true,
      message: "Verificación exitosa",
      data: {
        user: {
          id: user.id_usuario,
          nombre: user.nombre_completo,
          email: user.email,
          rol: user.rol,
        },
        token,
      },
    });

    // Configurar cookie de sesión
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in verify code:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
