import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { requireBusiness } from "@/lib/platform/data";
import { businessCsv } from "@/lib/platform/business-csv";

// Descargar usos: the same CSV as the web; the app saves and shares it.
export const GET = appRoute(async (request) => {
  await requireAppProfile("business");
  const { business, profile, role } = await requireBusiness();
  if (!business || role !== "owner") throw new AppError("No autorizado.", 403);
  const result = await businessCsv(
    business,
    profile,
    new URL(request.url).searchParams.get("period") || "30",
  );
  if ("error" in result) throw new AppError(result.error, result.status);
  return result;
});

export const OPTIONS = appOptions;
