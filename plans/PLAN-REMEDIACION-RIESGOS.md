# Plan de Remediación de Riesgos - Web Administrativa SADERH

## Tabla de Contenidos
1. [Fase 1: Correcciones Críticas (Semana 1)](#fase-1-correcciones-críticas-semana-1)
2. [Fase 2: Mejoras de Seguridad (Semanas 2-3)](#fase-2-mejoras-de-seguridad-semanas-2-3)
3. [Fase 3: Arquitectura y UX (Semanas 4-6)](#fase-3-arquitectura-y-ux-semanas-4-6)
4. [Fase 4: Estabilización (Semanas 7-8)](#fase-4-estabilización-semanas-7-8)

---

## Fase 1: Correcciones Críticas (Semana 1)

### 1.1 Corregir Código Duplicado en Middleware

**Archivo:** [`middleware.ts`](middleware.ts)

**Problema:** Líneas 81-96 duplicadas que causan comportamiento inesperado.

**Acción requerida:**
```typescript
// Eliminar desde línea 81 hasta 96
// El archivo debe terminar en la línea 80 con:
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
//   ],
// };
```

**Pasos:**
1. Abrir `middleware.ts`
2. Eliminar líneas 81-96 (código duplicado desde `}`)
3. Verificar que el archivo termine correctamente en línea 80
4. Probar que el middleware funciona correctamente

---

### 1.2 Restringir Server Actions

**Archivo:** [`next.config.ts`](next.config.ts:16)

**Problema:** `allowedOrigins: ["*"]` permite ataques desde cualquier dominio.

**Solución:**
```typescript
//Cambiar de:
experimental: {
  serverActions: { allowedOrigins: ["*"] },
}

//A:
experimental: {
  serverActions: { 
    allowedOrigins: process.env.NODE_ENV === "production" 
      ? ["https://campo-saas.vercel.app", "https://www.saderh.gob.mx"]
      : ["localhost:3000", "localhost:3001"] 
  },
}
```

**Pasos:**
1. Editar `next.config.ts`
2. Modificar la configuración de serverActions
3. Agregar variables de entorno para los orígenes permitidos
4. Verificar en desarrollo local

---

### 1.3 Ocultar Credenciales en Archivo de Ejemplo

**Archivo:** [`.env.local.example`](.env.local.example)

**Problema:** Credenciales reales visibles en el ejemplo.

**Solución:** Crear archivo sin valores:

```bash
# ===============================
# CAMPO-SAAS | Environment Variables
# Copia este archivo como .env.local y completa los valores
# ===============================

# ENTORNO
NODE_ENV=development

# JWT — Generate secure secrets (min 32 chars)
# Linux/Mac: openssl rand -hex 32
JWT_SECRET=your_jwt_secret_here
JWT_SECRET_APP=your_jwt_app_secret_here
JWT_SECRET_ADMIN=your_jwt_admin_secret_here

# NEON.TECH — PostgreSQL
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=campo-saas

# NEXT.JS
NEXTAUTH_URL=http://localhost:3000

# API EXTERNA (optional)
EXTERNAL_API_URL=
APP_MODE=web
```

**Pasos:**
1. Respaldar `.env.local.example` actual
2. Crear nueva versión sin valores sensibles
3. Documentar cómo generar los secrets en README.md

---

### 1.4 Agregar .env al .gitignore

**Archivo:** [`.gitignore`](.gitignore)

**Verificar que contenga:**
```
# Environment
.env
.env.local
.env.production
!.env.example
```

---

## Fase 2: Mejoras de Seguridad (Semanas 2-3)

### 2.1 Implementar Rate Limiting

**Crea:** `lib/rate-limit.ts`

```typescript
import { NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return async (request: Request) => {
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    const now = Date.now();
    const record = rateLimits.get(ip);
    
    if (!record || now > record.resetTime) {
      rateLimits.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { allowed: true };
    }
    
    if (record.count >= config.maxRequests) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((record.resetTime - now) / 1000) 
      };
    }
    
    record.count++;
    return { allowed: true };
  };
}

// Usage in API routes:
export async function withRateLimit(request: Request, config: RateLimitConfig) {
  const { allowed, retryAfter } = await rateLimit(config)(request);
  
  if (!allowed) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }
  return null;
}
```

**Aplicar en:**
- `/api/auth/login`
- `/api/usuarios` (POST)
- `/api/configuracion/*`
- `/api/notificaciones`
- `/api/correos`

---

### 2.2 Crear Wrapper para API Externa

**Crea:** `lib/api-client.ts`

```typescript
import { cookies } from "next/headers";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("campo_session")?.value;
  
  const baseUrl = process.env.EXTERNAL_API_URL || "";
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || `HTTP error ${response.status}`,
      errorData
    );
  }

  return response.json();
}
```

---

### 2.3 Sistema de Notificaciones Toast

**Crea:** `components/ui/Toast.tsx` (o usa el ya instalado `sonner`)

```typescript
// Ya tienes sonner instalado, úsalo consistentemente
import { toast } from "sonner";

// En lugar de:
alert("Error al crear usuario");

// Usar:
toast.error("Error al crear usuario", {
  description: "No se pudo completar la operación",
  duration: 5000,
});

// Para éxito:
toast.success("Usuario creado", {
  description: "El usuario ha sido dado de alta correctamente",
});
```

**Archivos a modificar:**
- `app/(dashboard)/admin/usuarios/UsuariosClient.tsx`
- `app/(dashboard)/admin/configuracion/ConfiguracionClient.tsx`
- Todos los componentes con `alert()`

---

### 2.4 Agregar Validación de Entrada con Zod

**Ya tienes Zod instalado, úsalo para:**

**Validação de usuario:**
```typescript
// lib/validations/usuario.ts
import { z } from "zod";

export const createUsuarioSchema = z.object({
  nombre_completo: z.string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(150, "Nombre muy largo"),
  email: z.string()
    .email("Email inválido")
    .endsWith("@hidalgo.gob.mx", "Debe ser correo institucional"),
  password: z.string()
    .min(8, "Contraseña mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
  rol: z.enum(["SUPER_ADMIN", "COORDINADOR", "TECNICO"]),
  especialidad: z.string().optional(),
  id_zona: z.number().optional(),
});
```

**Aplicar en:**
- `app/(dashboard)/admin/usuarios/UsuariosClient.tsx`
- Formularios de configuración

---

## Fase 3: Arquitectura y UX (Semanas 4-6)

### 3.1 Reemplazar window.location.reload()

**Problema:** `window.location.reload()` causa pérdida de estado.

**Solución:** Usar `router.refresh()` de Next.js:

```typescript
import { useRouter } from "next/navigation";

// En componentes:
const router = useRouter();

// En handleSubmit después de éxito:
router.refresh();
setModalOpen(false);
```

**Archivos a modificar:**
- `UsuariosClient.tsx` (líneas 81, 98, 128, 159)
- `ConfiguracionClient.tsx` (múltiples)

---

### 3.2 Implementar Hook de Fetching

**Crea:** `lib/hooks/use-fetch.ts`

```typescript
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useFetch<T>(url: string, options?: UseFetchOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (body?: unknown) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || "Error en la operación");
      }
      
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      setError(error);
      options?.onError?.(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return { data, loading, error, execute };
}
```

---

### 3.3 Traer Zonas desde el Backend

**Problema:** IDs hardcodeados en dropdowns.

**Solución:**

1. Crear endpoint o usar existente:
```typescript
// En la página server component:
async function getZonas() {
  const res = await fetch(`${process.env.EXTERNAL_API_URL}/zonas`);
  return res.json();
}
```

2. Modificar `UsuariosClient.tsx`:
```typescript
interface Props {
  // ... otros props
  zonas: { id_zona: number; nombre: string }[];
}

// En el select:
<select value={idZona} onChange={(e) => setIdZona(e.target.value)}>
  <option value="">Sin zona asignada</option>
  {zonas.map((zona) => (
    <option key={zona.id_zona} value={zona.id_zona}>
      {zona.nombre}
    </option>
  ))}
</select>
```

---

### 3.4 Implementar Auditoría

**Crea:** `lib/audit.ts`

```typescript
import { db } from "./db";
import { auditoria } from "./schema";

export async function logAudit(params: {
  id_usuario: number;
  tabla: string;
  id_registro: number;
  accion: "CREATE" | "UPDATE" | "DELETE";
  antes?: unknown;
  despues?: unknown;
  ip_address?: string;
}) {
  await db.insert(auditoria).values({
    id_usuario: params.id_usuario,
    tabla: params.tabla,
    id_registro: params.id_registro,
    accion: params.accion,
    antes: params.antes,
    despues: params.despues,
    ip_address: params.ip_address,
    fecha_accion: new Date(),
  });
}
```

**Usar en:**
- Crear/editar usuario
- Modificar configuraciones
- Enviar notificaciones/correos masivos
- Eliminar registros

---

### 3.5 Crear Página de Errores Personalizada

**Archivos a crear:**

```
app/
└── error.tsx
```

```typescript
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to external service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold text-guinda-900 mb-4">
        Algo salió mal
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message || "Ha ocurrido un error inesperado"}
      </p>
      <Button onClick={reset} className="bg-guinda-700 hover:bg-guinda-800">
        Intentar de nuevo
      </Button>
    </div>
  );
}
```

---

## Fase 4: Estabilización (Semanas 7-8)

### 4.1 Agregar Tests

**Instalar:**
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom jest
```

**Crear:**
- Tests unitarios para validaciones Zod
- Tests de integración para API
- Tests E2E para flujos críticos (login, crear usuario)

---

### 4.2 Documentación de API

**Crear:** `docs/API.md`

Documentar todos los endpoints externos que se consumen y sus formatos de respuesta.

---

### 4.3 Monitoreo y Alertas

**Integrar:**
- Sentry para tracking de errores
- LogRocket para recordings de sesión
- Pingdom/UptimeRobot para disponibilidad

---

### 4.4 Auditoría de Seguridad Externa

Considerar contratar una auditoría de seguridad externa antes de lanzar a producción.

---

## Checklist de Verificación

### Semana 1
- [ ] Código duplicado eliminado de middleware.ts
- [ ] Server Actions restringidos a orígenes específicos
- [ ] Credenciales eliminadas de .env.local.example
- [ ] .gitignore actualizado

### Semana 2-3
- [ ] Rate limiting implementado
- [ ] Wrapper de API con manejo de errores
- [ ] Todos los `alert()` reemplazados por toast
- [ ] Validaciones Zod en formularios

### Semana 4-6
- [ ] Todos los `window.location.reload()` eliminados
- [ ] Zonas traídas dinámicamente del backend
- [ ] Sistema de auditoría implementado
- [ ] Página de error personalizada

### Semana 7-8
- [ ] Tests implementados
- [ ] Documentación completa
- [ ] Monitoreo configurado

---

## Archivos a Modificar Summary

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `middleware.ts` | Eliminar líneas duplicadas | CRÍTICA |
| `next.config.ts` | Restringir Server Actions | CRÍTICA |
| `.env.local.example` | Eliminar valores sensibles | CRÍTICA |
| `.gitignore` | Verificar configuración | CRÍTICA |
| `lib/rate-limit.ts` | **NUEVO** | ALTA |
| `lib/api-client.ts` | **NUEVO** | ALTA |
| `UsuariosClient.tsx` | Reemplazar alert/reload | ALTA |
| `ConfiguracionClient.tsx` | Reemplazar alert/reload | ALTA |
| `lib/validations/*.ts` | **NUEVO** | MEDIA |
| `lib/hooks/use-fetch.ts` | **NUEVO** | MEDIA |
| `lib/audit.ts` | **NUEVO** | MEDIA |
| `app/error.tsx` | **NUEVO** | MEDIA |

---

*Plan generado el 5 de marzo de 2026*
