import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { password_reset_tokens, usuarios } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";
import { isValidToken } from "@/lib/sanitize";

/**
 * API endpoint para validar tokens de reset de contraseña
 * 
 * Valida que:
 * 1. El formato del token sea válido
 * 2. El token exista en la base de datos
 * 3. El token no haya sido usado
 * 4. El token no haya expirado
 * 5. El usuario asociado esté activo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // 1. Validar formato del token
    if (!token || !isValidToken(token)) {
      return NextResponse.json(
        { valid: false, error: "Token inválido" },
        { status: 400 }
      );
    }

    // 2. Buscar el token en la base de datos
    const [tokenRecord] = await db
      .select()
      .from(password_reset_tokens)
      .where(
        and(
          eq(password_reset_tokens.token, token),
          eq(password_reset_tokens.usado, false)
        )
      )
      .limit(1);

    // 3. Verificar que el token exista
    if (!tokenRecord) {
      return NextResponse.json(
        { valid: false, error: "Token no encontrado o ya utilizado" },
        { status: 404 }
      );
    }

    // 4. Verificar que el token no haya expirado
    const now = new Date();
    if (new Date(tokenRecord.fecha_expira) < now) {
      return NextResponse.json(
        { valid: false, error: "Token expirado" },
        { status: 410 }
      );
    }

    // 5. Verificar que el usuario exista y esté activo
    const [user] = await db
      .select({
        id_usuario: usuarios.id_usuario,
        nombre_completo: usuarios.nombre_completo,
        email: usuarios.email,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(eq(usuarios.id_usuario, tokenRecord.id_usuario))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { valid: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { valid: false, error: "Usuario inactivo" },
        { status: 403 }
      );
    }

    // Token válido
    return NextResponse.json({
      valid: true,
      user: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Error validating reset token:", error);
    return NextResponse.json(
      { valid: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
