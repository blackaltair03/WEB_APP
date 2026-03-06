import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { signWebToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select({
        id_usuario: usuarios.id_usuario,
        email: usuarios.email,
        nombre_completo: usuarios.nombre_completo,
        rol: usuarios.rol,
        password_hash: usuarios.password_hash,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: "Tu cuenta está desactivada" },
        { status: 403 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await signWebToken({
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_completo: user.nombre_completo,
      rol: user.rol as "SUPER_ADMIN" | "COORDINADOR" | "TECNICO",
    });

    const response = NextResponse.json({
      ok: true,
      rol: user.rol,
      user: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        email: user.email,
      },
    });

    response.cookies.set("campo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

