export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  platform: string | null;
  status: "pending" | "verified" | "rejected" | "suspended";
  role: "driver" | "business";
  created_at: string;
  closed_at: string | null;
};
export type Business = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  description: string;
  is_active: boolean;
  owner_user_id: string | null;
};
export type Benefit = {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_label: string;
  savings_amount: number | null;
  terms: string;
  category: string;
  monthly_limit: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  rp_businesses: Business;
};
export type Redemption = {
  id: string;
  benefit_title: string;
  business_name: string;
  savings_amount: number | null;
  redeemed_at: string;
};
export type Verification = {
  id: string;
  driver_id: string;
  photo_path: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
};
export type ActionState = {
  error?: string;
  success?: string;
  revisionId?: string;
  submitted?: boolean;
};
export const platforms: Record<string, string> = {
  uber: "Uber",
  indrive: "inDrive",
  pedidosya: "PedidosYa",
  multiple: "Varias plataformas",
};
export const categories: Record<string, string> = {
  combustible: "Combustible",
  comida: "Comida",
  mantenimiento: "Mantenimiento",
  salud: "Salud",
  otros: "Otros",
};
// Kept in sync by hand with the $15.00/month price shown in
// AuthPage/driver/membership — there is no shared pricing table yet.
export const MEMBERSHIP_PRICE_USD = 15;
export const statuses: Record<string, string> = {
  pending: "Por verificar",
  verified: "Verificado",
  rejected: "Requiere revisión",
  suspended: "Cuenta suspendida",
};
export function money(value: number) {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-PA", {
    dateStyle: "medium",
    timeZone: "America/Panama",
  }).format(new Date(value));
}
export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
