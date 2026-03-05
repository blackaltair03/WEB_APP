# 🌾 CAMPO-SAAS WEB — SADERH Sistema de Gestión (Frontend)

> Sistema web frontend para la Secretaría de Agricultura y Desarrollo Rural del Estado de Hidalgo.  
> **Stack: Next.js 15 + React + Tailwind CSS + CSS Modules**

---

## 🏗️ Arquitectura

Este proyecto es el **FRONTEND** del sistema. La API está en un proyecto separado.

```
campo-saas-web/                     ← Frontend (este proyecto)
├── app/
│   ├── (auth)/login/               Pantalla de login
│   └── (dashboard)/
│       ├── admin/                  SUPER_ADMIN rutas
│       ├── coordinador/            COORDINADOR rutas
│       └── tecnico/                TECNICO rutas
├── components/
│   ├── layout/   Sidebar, PageHeader
│   ├── dashboard/ StatsCard
│   ├── tables/   DataTable
│   ├── maps/     MapView (react-leaflet)
│   └── forms/    DynamicForm
├── lib/
│   ├── auth.ts    JWT validation (cookies)
│   └── utils.ts   Formatters, helpers
├── middleware.ts   Protección de rutas por rol
└── types/index.ts  TypeScript types
```

### Proyecto API separado

La API está documentada en [API-STRUCTURE.md](API-STRUCTURE.md).  
Crea un proyecto Next.js separado siguiendo esa guía.

---

## 🚀 Setup Local

### 1. Clonar e instalar
```bash
git clone <tu-repo>
cd campo-saas
npm install
```

### 2. Variables de entorno
```bash
cp .env.local.example .env.local
# Edita .env.local:
# - JWT_SECRET (para validar tokens de sesión)
# - EXTERNAL_API_URL=http://localhost:3001 (para desarrollo local)
```

No necesitas DATABASE_URL ni Cloudinary en el proyecto web, solo en la API.

### 3. Levantar servidor de desarrollo
```bash
npm run dev
# → http://localhost:3000
```

> **Importante**: Asegúrate de tener la API corriendo en `http://localhost:3001` o configura `EXTERNAL_API_URL` a tu API desplegada.

---

## ☁️ Deploy en Vercel

### Deploy del Frontend (este proyecto)

#### Opción A — CLI
```bash
npm install -g vercel
vercel login
vercel --prod

# O con npx (sin instalar globalmente)
npx vercel --prod
```

#### Opción B — GitHub (CI/CD automático)
1. Conecta el repo en vercel.com → "Import Project"
2. Agrega variables de entorno en Vercel Dashboard:

```
NODE_ENV=production
APP_MODE=web
EXTERNAL_API_URL=https://campo-saas-api.vercel.app
JWT_SECRET=tu_secret_web_min32chars
JWT_SECRET_APP=tu_secret_app_min32chars
JWT_SECRET_ADMIN=tu_secret_admin_min32chars
NEXTAUTH_URL=https://campo-saas-web.vercel.app
```

3. Cada `git push` a `main` hace deploy automático ✅

---

### Deploy de la API (proyecto separado)

Sigue la guía completa en [API-STRUCTURE.md](API-STRUCTURE.md) para crear y desplegar el proyecto de la API.

---

## 📱 App Móvil (React Native / Expo)

La app consume las mismas rutas de la API. Cambia solo el dominio:

```typescript
// config/api.ts en la app Expo
const API_BASE = __DEV__
  ? "http://192.168.1.X:3000/api"     // dev local
  : "https://tu-app.vercel.app/api";  // producción

// Login
const login = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, client: "app" }),
  });
  const { data } = await res.json();
  // data.token → guarda en SecureStore
  // data.user  → info del técnico
};

// Sincronizar bitácoras offline
const sync = async (token: string, bitacoras: any[]) => {
  const res = await fetch(`${API_BASE}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      tipo: "BITACORA",
      uuid_dispositivo: await DeviceInfo.getUniqueId(),
      registros: bitacoras,
    }),
  });
  return res.json();
};
```

### Endpoints disponibles para la app móvil

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login con `client: "app"` → devuelve token |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/beneficiarios` | Lista (con ?page=&search=) |
| POST | `/api/beneficiarios` | Crear beneficiario |
| GET  | `/api/asignaciones?tecnico_id=X` | Asignaciones del técnico |
| POST | `/api/sync` | **Sync masivo** bitácoras + beneficiarios |
| GET  | `/api/health` | Health check |

---

## 🗄️ Base de Datos

**Sin cambios** — misma Neon.tech, mismo DATABASE_URL.

Para ver el schema visual:
```bash
npm run db:studio
# → Abre Drizzle Studio en el navegador
```

---

## 🎨 Design System

Colores definidos en `tailwind.config.ts`:

```
campo-500  → Verde primario   #2d8f2d
tierra-500 → Dorado tierra    #c4852a
```

Sidebar: fondo verde bosque oscuro `hsl(120, 40%, 10%)`

---

## 📁 Estructura de páginas por rol

### SUPER_ADMIN
- `/admin/dashboard` — Estadísticas globales
- `/admin/usuarios` — CRUD técnicos y coordinadores
- `/admin/beneficiarios` — Todos los beneficiarios
- `/admin/asignaciones` — Gestión de asignaciones
- `/admin/bitacoras` — Todas las bitácoras
- `/admin/fieldops` — Mapa de operaciones
- `/admin/reportes` — Reportes y exportación
- `/admin/periodos` — Períodos de cierre
- `/admin/settings` — Configuración del sistema
- `/admin/auditoria` — Log de auditoría

### COORDINADOR
- `/coordinador/dashboard`
- `/coordinador/asignaciones`
- `/coordinador/bitacoras`
- `/coordinador/reportes`

### TECNICO
- `/tecnico/dashboard`
- `/tecnico/asignaciones`
- `/tecnico/bitacoras`

---

## 🔒 Seguridad

- **JWT web**: HTTP-only cookie, 8h, sólo para el dashboard
- **JWT app**: Bearer token, 30 días, para la app móvil
- **Middleware**: Protege rutas antes de que lleguen al Server Component
- **Role-based**: Cada ruta valida el rol del usuario
- **Bcrypt**: Passwords con cost factor 12
- **Headers CORS**: Solo para `/api/*`, configurados en `vercel.json`

---

## 🛠️ Scripts

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run db:push      # Sincroniza schema → DB (dev)
npm run db:migrate   # Ejecuta migraciones (prod)
npm run db:studio    # Abre Drizzle Studio
npm run db:generate  # Genera archivos de migración
```
