// The shape of /api/app/business/manage (the owner's editable data).
export type Manage = {
  info: { name: string; description: string; address: string; phone: string; category: string };
  pending_change: boolean;
  /** Seven days, domingo first; each null (closed) or [open, close]. */
  hours: ([string, string] | null)[] | null;
  logo: { path: string; url: string } | null;
  photos: { path: string; url: string }[];
  staff: { user_id: string; full_name: string }[];
};

export const MANAGE_PATH = "/api/app/business/manage";
