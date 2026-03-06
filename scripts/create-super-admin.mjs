import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

function loadEnvFile(fileName) {
  const fullPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) return;

  const raw = fs.readFileSync(fullPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Falta DATABASE_URL en variables de entorno");
  process.exit(1);
}

const nombre = getArg("--name") ?? process.env.SEED_ADMIN_NAME ?? "Super Admin SADERH";
const email = (getArg("--email") ?? process.env.SEED_ADMIN_EMAIL ?? "admin@saderh.local").toLowerCase();
const password = getArg("--password") ?? process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";

if (password.length < 10) {
  console.error("❌ La contraseña debe tener mínimo 10 caracteres");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  const existing = await sql`
    SELECT id_usuario, email
    FROM usuarios
    WHERE rol = 'SUPER_ADMIN' AND activo = true
    LIMIT 1
  `;

  if (existing.length > 0) {
    console.log("ℹ️ Ya existe un SUPER_ADMIN activo:", existing[0].email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const inserted = await sql`
    INSERT INTO usuarios (
      nombre_completo,
      email,
      codigo_acceso,
      codigo_acceso_hash,
      rol,
      activo,
      puede_registrar_beneficiarios,
      bloqueado_revision,
      fecha_creacion
    )
    VALUES (
      ${nombre},
      ${email},
      ${password},
      ${passwordHash},
      'SUPER_ADMIN',
      true,
      true,
      false,
      NOW()
    )
    RETURNING id_usuario, nombre_completo, email, rol
  `;

  console.log("✅ SUPER_ADMIN creado correctamente");
  console.log("ID:", inserted[0].id_usuario);
  console.log("Nombre:", inserted[0].nombre_completo);
  console.log("Email:", inserted[0].email);
  console.log("Rol:", inserted[0].rol);
  console.log("Password temporal:", password);
}

main().catch((error) => {
  console.error("❌ Error creando SUPER_ADMIN:", error?.message ?? error);
  process.exit(1);
});
