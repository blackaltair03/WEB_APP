# 🔌 CAMPO-SAAS API - Estructura Completa

> Documentación completa para recrear la API en un proyecto separado

---

## 📁 Estructura de Directorios

```
campo-saas-api/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   └── logout/
│       │       └── route.ts
│       ├── beneficiarios/
│       │   └── route.ts
│       ├── usuarios/
│       │   └── route.ts
│       ├── asignaciones/
│       │   └── route.ts
│       ├── configuracion/
│       │   ├── localidades/
│       │   │   └── route.ts
│       │   ├── plantillas/
│       │   │   └── route.ts
│       │   └── formatos/
│       │       └── route.ts
│       ├── notificaciones/
│       │   └── route.ts
│       ├── correos/
│       │   └── route.ts
│       ├── sync/
│       │   └── route.ts
│       └── health/
│           └── route.ts
├── lib/
│   ├── db.ts
│   ├── schema.ts
│   ├── auth.ts
│   ├── api-response.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── .env.local
└── vercel.json
```

---

## 📦 package.json

```json
{
  "name": "campo-saas-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "next": "^15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "drizzle-orm": "^0.38.2",
    "@neondatabase/serverless": "^0.10.4",
    "jose": "^5.9.6",
    "zod": "^3.24.1",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "@types/bcrypt": "^5.0.2",
    "typescript": "^5.7.2",
    "drizzle-kit": "^0.30.1"
  }
}
```

---

## ⚙️ next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

export default nextConfig;
```

---

## 🔐 middleware.ts (API-only mode)

```typescript
import { NextRequest, NextResponse } from "next/server";

const APP_MODE = process.env.APP_MODE;
const WEB_ORIGIN = process.env.WEB_ORIGIN;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // En modo API, solo servir rutas /api/*
  if (APP_MODE === "api") {
    // Permitir /api/* y /health
    if (!pathname.startsWith("/api/") && pathname !== "/health") {
      return NextResponse.json(
        { error: "Not Found" },
        { status: 404 }
      );
    }

    // Headers CORS para modo API
    const response = NextResponse.next();

    // Preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": WEB_ORIGIN || "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Actual request
    response.headers.set("Access-Control-Allow-Origin", WEB_ORIGIN || "*");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 🗄️ lib/db.ts

```typescript
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool);
```

---

## 🏗️ lib/schema.ts

```typescript
import { pgTable, serial, varchar, text, timestamp, boolean, integer, jsonb, decimal } from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  id_usuario: serial("id_usuario").primaryKey(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  nombre_completo: varchar("nombre_completo", { length: 150 }).notNull(),
  rol: varchar("rol", { length: 20 }).notNull(),
  especialidad: varchar("especialidad", { length: 100 }),
  telefono: varchar("telefono", { length: 20 }),
  id_zona: integer("id_zona"),
  activo: boolean("activo").default(true).notNull(),
  fecha_creacion: timestamp("fecha_creacion").defaultNow().notNull(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow().notNull(),
});

export const beneficiarios = pgTable("beneficiarios", {
  id_beneficiario: serial("id_beneficiario").primaryKey(),
  folio_saderh: varchar("folio_saderh", { length: 50 }).unique(),
  curp: varchar("curp", { length: 18 }).unique(),
  nombre_completo: varchar("nombre_completo", { length: 150 }).notNull(),
  municipio: varchar("municipio", { length: 100 }).notNull(),
  localidad: varchar("localidad", { length: 100 }).notNull(),
  cadena_productiva: varchar("cadena_productiva", { length: 50 }),
  telefono_contacto: varchar("telefono_contacto", { length: 20 }),
  latitud_predio: varchar("latitud_predio", { length: 50 }),
  longitud_predio: varchar("longitud_predio", { length: 50 }),
  origen_registro: varchar("origen_registro", { length: 10 }).notNull(),
  uuid_movil_registro: varchar("uuid_movil_registro", { length: 50 }),
  documentos: jsonb("documentos").default({}).notNull(),
  fecha_registro: timestamp("fecha_registro").defaultNow().notNull(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow().notNull(),
});

export const asignaciones = pgTable("asignaciones", {
  id_asignacion: serial("id_asignacion").primaryKey(),
  id_tecnico: integer("id_tecnico").notNull(),
  id_beneficiario: integer("id_beneficiario"),
  tipo_asignacion: varchar("tipo_asignacion", { length: 50 }).notNull(),
  descripcion_actividad: text("descripcion_actividad"),
  fecha_limite: varchar("fecha_limite", { length: 20 }).notNull(),
  completado: boolean("completado").default(false).notNull(),
  fecha_creacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

export const configuracion_sistema = pgTable("configuracion_sistema", {
  id_config: serial("id_config").primaryKey(),
  clave: varchar("clave", { length: 100 }).notNull().unique(),
  valor: text("valor").notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  descripcion: text("descripcion"),
  id_usuario_modifico: integer("id_usuario_modifico"),
  fecha_modificacion: timestamp("fecha_modificacion").defaultNow().notNull(),
});

export const plantillas_pdf = pgTable("plantillas_pdf", {
  id_plantilla: serial("id_plantilla").primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  configuracion: jsonb("configuracion").default({}).notNull(),
  activo: boolean("activo").default(true).notNull(),
  id_usuario_modifico: integer("id_usuario_modifico"),
  fecha_creacion: timestamp("fecha_creacion").defaultNow().notNull(),
  fecha_modificacion: timestamp("fecha_modificacion").defaultNow().notNull(),
});

export const notificaciones = pgTable("notificaciones", {
  id_notificacion: serial("id_notificacion").primaryKey(),
  id_usuario: integer("id_usuario").notNull(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  mensaje: text("mensaje").notNull(),
  tipo: varchar("tipo", { length: 20 }).default("INFO").notNull(),
  leida: boolean("leida").default(false).notNull(),
  fecha_creacion: timestamp("fecha_creacion").defaultNow().notNull(),
});
```

---

## 🔑 lib/auth.ts

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { usuarios } from "./schema";
import { eq } from "drizzle-orm";

export type UserRole = "SUPER_ADMIN" | "COORDINADOR" | "TECNICO";

export interface SessionPayload {
  id_usuario: number;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  especialidad?: string;
  id_zona?: number;
}

const WEB_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const APP_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_APP!);

export async function signWebToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .setIssuedAt()
    .sign(WEB_SECRET);
}

export async function verifyWebToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, WEB_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function signAppToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(APP_SECRET);
}

export async function verifyAppToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, APP_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("campo_session")?.value;
  if (!token) return null;
  return verifyWebToken(token);
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await signWebToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("campo_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("campo_session");
}

export async function getTokenFromHeader(authHeader: string | null): Promise<SessionPayload | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return (await verifyAppToken(token)) ?? (await verifyWebToken(token));
}
```

---

## 📤 lib/api-response.ts

```typescript
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ ok: false, message, errors }, { status: 400 });
}

export function unauthorized(message = "No autorizado") {
  return NextResponse.json({ ok: false, message }, { status: 401 });
}

export function forbidden(message = "Sin permisos") {
  return NextResponse.json({ ok: false, message }, { status: 403 });
}

export function notFound(message = "Recurso no encontrado") {
  return NextResponse.json({ ok: false, message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 409 });
}

export function serverError(message = "Error interno del servidor", error?: unknown) {
  console.error("[API Error]", message, error);
  return NextResponse.json({ ok: false, message }, { status: 500 });
}
```

---

## 🛣️ API Routes

### POST /api/auth/login

```typescript
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ok, badRequest, unauthorized } from "@/lib/api-response";
import { signWebToken, signAppToken, setSession } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, client } = body;

    if (!email || !password) {
      return badRequest("Email y contraseña son requeridos");
    }

    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (!user || !user.activo) {
      return unauthorized("Credenciales inválidas");
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return unauthorized("Credenciales inválidas");
    }

    const payload = {
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_completo: user.nombre_completo,
      rol: user.rol as any,
      especialidad: user.especialidad || undefined,
      id_zona: user.id_zona || undefined,
    };

    // App móvil → devuelve token
    if (client === "app") {
      const token = await signAppToken(payload);
      return ok({ token, user: payload });
    }

    // Web → establece cookie
    await setSession(payload);
    return ok({ user: payload });
  } catch (error) {
    console.error("Error en login:", error);
    return unauthorized("Error en autenticación");
  }
}
```

### POST /api/auth/logout

```typescript
import { clearSession } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export async function POST() {
  await clearSession();
  return ok({ message: "Sesión cerrada" });
}
```

### GET /api/health

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "campo-saas-api",
  });
}
```

### GET/POST /api/beneficiarios

```typescript
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { beneficiarios } from "@/lib/schema";
import { eq, ilike, or, count, asc } from "drizzle-orm";
import { getSession, getTokenFromHeader } from "@/lib/auth";
import { ok, created, badRequest, unauthorized, serverError, conflict } from "@/lib/api-response";
import { z } from "zod";

const createBeneficiarioSchema = z.object({
  folio_saderh: z.string().max(50).optional(),
  curp: z.string().length(18).toUpperCase().optional(),
  nombre_completo: z.string().min(3).max(150),
  municipio: z.string().min(2).max(100),
  localidad: z.string().min(2).max(100),
  cadena_productiva: z.enum(["AGRICOLA", "AGROPECUARIO"]).optional(),
  telefono_contacto: z.string().max(20).optional(),
  latitud_predio: z.string().optional(),
  longitud_predio: z.string().optional(),
  origen_registro: z.enum(["WEB", "MOVIL"]).default("WEB"),
  uuid_movil_registro: z.string().uuid().optional(),
  documentos: z.record(z.unknown()).default({}),
});

async function getAuth(request: NextRequest) {
  const session = await getSession();
  if (session) return session;
  return getTokenFromHeader(request.headers.get("authorization"));
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuth(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = db.select().from(beneficiarios).$dynamic();

    if (search) {
      query = query.where(
        or(
          ilike(beneficiarios.nombre_completo, `%${search}%`),
          ilike(beneficiarios.folio_saderh, `%${search}%`),
          ilike(beneficiarios.curp, `%${search}%`)
        )
      );
    }

    const [items, [{ value: total }]] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(asc(beneficiarios.fecha_registro)),
      db.select({ value: count() }).from(beneficiarios),
    ]);

    return ok({ beneficiarios: items, total, page, limit });
  } catch (error) {
    return serverError("Error al obtener beneficiarios", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const validated = createBeneficiarioSchema.parse(body);

    // Verificar duplicados
    if (validated.curp) {
      const existing = await db
        .select()
        .from(beneficiarios)
        .where(eq(beneficiarios.curp, validated.curp))
        .limit(1);
      
      if (existing.length > 0) {
        return conflict("Ya existe un beneficiario con este CURP");
      }
    }

    const [nuevoBeneficiario] = await db
      .insert(beneficiarios)
      .values(validated)
      .returning();

    return created(nuevoBeneficiario);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest("Datos inválidos", error.errors);
    }
    return serverError("Error al crear beneficiario", error);
  }
}
```

### Continúa en los archivos de las demás rutas... (asignaciones, configuracion, notificaciones, correos, sync)

---

## 🌍 Variables de Entorno (.env.local)

```env
# Base de datos
DATABASE_URL=postgresql://...

# JWT Secrets
JWT_SECRET=tu_secret_web_min32chars
JWT_SECRET_APP=tu_secret_app_min32chars
JWT_SECRET_ADMIN=tu_secret_admin_min32chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=campo
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=campo-saas

# Modo deployment
APP_MODE=api
WEB_ORIGIN=https://campo-saas-web.vercel.app
NODE_ENV=production
```

---

## 🚀 Deploy en Vercel

### vercel.json

```json
{
  "version": 2,
  "name": "campo-saas-api",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "NODE_ENV": "production",
    "APP_MODE": "api"
  },
  "build": {
    "env": {
      "APP_MODE": "api"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type,Authorization,X-Api-Key" }
      ]
    }
  ]
}
```

### Comandos deployment

```bash
# Login
vercel login

# Deploy
vercel --prod

# O con npx
npx vercel --prod
```

---

## ✅ Checklist de Implementación

1. [ ] Crear nuevo proyecto Next.js
2. [ ] Copiar estructura de carpetas
3. [ ] Instalar dependencias (package.json)
4. [ ] Copiar archivos lib/ (db, schema, auth, api-response, utils)
5. [ ] Copiar todas las rutas app/api/*
6. [ ] Configurar middleware.ts
7. [ ] Configurar next.config.ts
8. [ ] Crear .env.local con variables
9. [ ] Ejecutar drizzle-kit push para migrar DB
10. [ ] Probar localmente con `npm run dev`
11. [ ] Deploy a Vercel con `vercel --prod`
12. [ ] Configurar variables de entorno en Vercel Dashboard
13. [ ] Probar endpoints con curl/Postman

---

## 🧪 Testing Local

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saderh.gob.mx","password":"tu_password","client":"web"}'

# Crear beneficiario
curl -X POST http://localhost:3001/api/beneficiarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"nombre_completo":"Test","municipio":"Pachuca","localidad":"Centro"}'
```

---

**Listo para crear proyecto separado de API. Todo está documentado.**
