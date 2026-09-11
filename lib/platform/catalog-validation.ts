import { z } from "zod";
import { uuidSchema } from "./validation";
const category = z.enum([
  "combustible",
  "comida",
  "mantenimiento",
  "salud",
  "otros",
]);
const optionalId = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || uuidSchema.safeParse(v).success,
    "Selecciona una cuenta responsable válida de la lista.",
  );
export const businessSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  address: z.string().trim().min(3).max(250),
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^[+0-9 ()-]*$/),
  category,
  owner_user_id: optionalId,
});
export const benefitSchema = z
  .object({
    id: optionalId,
    business_id: z.uuid(),
    title: z.string().trim().min(2).max(140),
    description: z.string().trim().min(5).max(3000),
    discount_label: z.string().trim().min(2).max(100),
    terms: z.string().trim().min(5).max(3000),
    category,
    savings_amount: z.union([
      z.literal(""),
      z.coerce.number().min(0).max(999999),
    ]),
    monthly_limit: z.union([
      z.literal(""),
      z.coerce.number().int().min(1).max(1000),
    ]),
    valid_from: z.union([z.literal(""), z.iso.date()]),
    valid_until: z.union([z.literal(""), z.iso.date()]),
  })
  .refine(
    (v) => !v.valid_from || !v.valid_until || v.valid_until >= v.valid_from,
    { message: "La fecha final debe ser posterior a la inicial." },
  );
