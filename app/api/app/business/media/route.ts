import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { uploadBusinessMedia } from "@/lib/platform/business-actions";

// Logo y fotos: the web's own uploadBusinessMedia. Multipart with "kind"
// (logo | photo) and "file".
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new AppError("Selecciona una imagen JPG, PNG o WebP de hasta 2 MB.");
  }
  const result = await uploadBusinessMedia({}, form);
  if (result.error) throw new AppError(result.error);
  return { message: result.success };
});

export const OPTIONS = appOptions;
