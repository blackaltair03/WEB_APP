# 🚀 Deployment Web - Campo SAAS

## Este proyecto es SOLO FRONTEND

La API está en un proyecto separado. Ver [API-STRUCTURE.md](API-STRUCTURE.md) para crear el proyecto de la API.

---

## 🔧 Preparación Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea o edita `.env.local`:

```env
# JWT Secrets (mismos que en la API)
JWT_SECRET=tu_secret_web_min32chars
JWT_SECRET_APP=tu_secret_app_min32chars
JWT_SECRET_ADMIN=tu_secret_admin_min32chars

# URL de la API (local en desarrollo, externa en producción)
APP_MODE=web
EXTERNAL_API_URL=http://localhost:3001

# NextAuth
NEXTAUTH_URL=http://localhost:3000
```

### 3. Levantar en desarrollo

```bash
npm run dev
```

> **Importante**: Asegúrate de tener la API corriendo en el puerto 3001 (o la URL que configuraste en EXTERNAL_API_URL)

---

## ☁️ Deploy en Vercel

### Opción 1: vía CLI con npx (sin instalación global)

```bash
npx vercel --prod
```

### Opción 2: vía CLI instalado globalmente

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Opción 3: GitHub Auto-Deploy  

1. Conecta tu repo en https://vercel.com
2. Click "Import Project"
3. Configura las variables de entorno (ver abajo)
4. Cada push a `main` hará deploy automático

---

## 🔐 Variables de Entorno en Vercel

Ve a **Settings → Environment Variables** en tu proyecto Vercel y agrega:

```
NODE_ENV=production
APP_MODE=web
EXTERNAL_API_URL=https://tu-api-deployada.vercel.app
JWT_SECRET=tu_secret_web_min32chars
JWT_SECRET_APP=tu_secret_app_min32chars
JWT_SECRET_ADMIN=tu_secret_admin_min32chars
NEXTAUTH_URL=https://tu-web-deployada.vercel.app
```

> ⚠️ **EXTERNAL_API_URL** debe apuntar a tu proyecto API desplegado

---

## 📋 Checklist de Deployment

### Paso 1: Deploy de la API (proyecto separado)
- [ ] Crear proyecto API según [API-STRUCTURE.md](API-STRUCTURE.md)
- [ ] Deploy API a Vercel
- [ ] Anotar la URL de la API: `https://_____.vercel.app`
- [ ] Configurar variables de entorno en la API (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Probar endpoint: `curl https://tu-api.vercel.app/api/health`

### Paso 2: Deploy del Web (este proyecto)
- [ ] Configurar `EXTERNAL_API_URL` con la URL de la API del paso 1
- [ ] Deploy del Web a Vercel
- [ ] Anotar la URL del Web: `https://_____.vercel.app`
- [ ] Configurar variables de entorno en el Web
- [ ] Probar login en `https://tu-web.vercel.app/login`

### Paso 3: Configurar CORS en la API
- [ ] En el proyecto API, actualizar variable `WEB_ORIGIN=https://tu-web.vercel.app`  
- [ ] Redeploy la API para aplicar cambios

---

## 🧪 Probar que todo funciona

1. **Health check API**:
   ```bash
   curl https://tu-api.vercel.app/api/health
   ```
   
   Deberías ver: `{"status":"healthy",...}`

2. **Abrir el Web**:
   ```
   https://tu-web.vercel.app/login
   ```
   
   Deberías ver la pantalla de login

3. **Hacer login**:
   - Email: `admin@saderh.gob.mx`
   - Password: (el que configuraste en la API)
   
   Si funciona, serás redirigido al dashboard

---

## ❌ Troubleshooting

### Error: "Failed to fetch" o CORS

**Causa**: La API no está corriendo o `EXTERNAL_API_URL` está mal configurado.

**Solución**:
1. Verifica que `EXTERNAL_API_URL` en el Web apunte a la URL correcta de la API
2. Verifica que `WEB_ORIGIN` en la API tenga la URL del Web
3. Redeploy ambos proyectos

### Error: "Unauthorized" al hacer login

**Causa**: Los `JWT_SECRET` no coinciden entre API y Web.

**Solución**:
1. Verifica que `JWT_SECRET`, `JWT_SECRET_APP` y `JWT_SECRET_ADMIN` sean **idénticos** en ambos proyectos
2. Redeploy ambos

### Error: No redirige después de login exitoso

**Causa**: `NEXTAUTH_URL` no está configurado correctamente.

**Solución**:
1. Configura `NEXTAUTH_URL=https://tu-web.vercel.app` (sin `/` al final)
2. Redeploy el Web

---

## 📝 Notas

- Este proyecto NO tiene conexión directa a base de datos
- Todas las llamadas a `/api/*` se proxean automáticamente a `EXTERNAL_API_URL`
- Los tokens JWT se validan localmente (por eso necesitas `JWT_SECRET`)
- Los cookies de sesión solo funcionan para el dominio web (no para la app móvil)

---

**¿Listo para deployar? Ejecuta `npx vercel --prod` 🚀**
