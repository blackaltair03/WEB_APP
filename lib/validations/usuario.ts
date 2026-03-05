import { z } from "zod";

/**
 * Validations for user-related operations
 */

// Password requirements:
// - At least 10 characters (increased from 8)
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character
const passwordRequirements = z
  .string()
  .min(10, "La contraseña debe tener al menos 10 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[!@#$%^&*]/, "Debe contener al menos un carácter especial (!@#$%^&*)");

// Reset password - same security requirements as regular passwords
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  nueva_password: passwordRequirements, // Reuse same requirements for consistency
});

export const createUsuarioSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede exceder 150 caracteres")
    .trim(),

  email: z
    .string()
    .email("Correo electrónico inválido")
    .endsWith("@hidalgo.gob.mx", "Debe ser un correo institucional (@hidalgo.gob.mx)")
    .toLowerCase()
    .trim(),

  password: passwordRequirements,

  rol: z.enum(["SUPER_ADMIN", "COORDINADOR", "TECNICO"], {
    errorMap: () => ({ message: "Rol inválido" }),
  }),

  especialidad: z
    .string()
    .max(30, "La especialidad no puede exceder 30 caracteres")
    .optional()
    .or(z.literal("")),

  id_zona: z
    .number()
    .int("ID de zona inválido")
    .positive("ID de zona inválido")
    .optional(),

  puede_registrar_beneficiarios: z.boolean().default(false),
});

export const updateUsuarioSchema = createUsuarioSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: passwordRequirements.optional(),
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .trim(),

  password: z.string().min(1, "La contraseña es requerida"),
});

// Type exports for use in components
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validate data against a schema and return formatted errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
