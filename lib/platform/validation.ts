import { z } from "zod";
export const platformSchema = z.enum([
  "uber",
  "indrive",
  "pedidosya",
  "multiple",
]);
export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo.")
    .max(100, "El nombre es demasiado largo."),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9 ()-]{8,20}$/,
      "Escribe un teléfono válido con código de país.",
    )
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    }, "Escribe un teléfono válido con código de país."),
  platform: platformSchema,
});
export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email("Escribe un correo válido.").max(254))
  .transform((v) => v.toLowerCase());
export const passwordSchema = z
  .string()
  .min(10, "Usa al menos 10 caracteres.")
  .max(128, "Usa un máximo de 128 caracteres.");
export const signupSchema = profileSchema.extend({
  email: emailSchema,
  password: passwordSchema,
  terms: z.literal("on", {
    error: "Acepta los términos y la política de privacidad.",
  }),
});
export const uuidSchema = z.uuid();
export function safeNext(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\r\n]/.test(value)
  )
    return "/driver/dashboard";
  try {
    const url = new URL(value, "https://rideperks.app");
    if (url.origin !== "https://rideperks.app") return "/driver/dashboard";
    if (
      /^\/(driver|business)(\/|$)/.test(url.pathname) ||
      url.pathname === "/account/password"
    )
      return url.pathname + url.search;
  } catch {}
  return "/driver/dashboard";
}
export function firstError(error: z.ZodError) {
  return error.issues[0]?.message || "Revisa los datos del formulario.";
}
