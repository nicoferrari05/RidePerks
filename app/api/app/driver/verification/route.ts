import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { getVerification } from "@/lib/platform/data";
import { uploadVerification } from "@/lib/platform/driver-actions";

// Verificación: the state /driver/verify shows, and the upload, which is
// the web's own uploadVerification (same size, format and pending checks).
export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  const v = await getVerification(p.id);
  return {
    status: p.status,
    pending: v?.status === "pending",
    rejected_note:
      v?.status === "rejected" && p.status !== "verified"
        ? v.admin_notes ||
          "Asegúrate de que tu nombre y la plataforma se vean completos."
        : null,
  };
});

// The app sends the photo as multipart/form-data, field "photo".
export const POST = appRoute(async (request) => {
  await requireAppProfile("driver");
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new AppError("Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
  }
  const result = await uploadVerification({}, form);
  if (result.error) throw new AppError(result.error);
  return { message: result.success };
});

export const OPTIONS = appOptions;
