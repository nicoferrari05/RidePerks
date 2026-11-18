import {
  AppError,
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { saveHours } from "@/lib/platform/business-actions";

// Horario: the web's own saveHours. The app sends seven days, domingo first:
// { open, from, to } each.
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  if (!Array.isArray(body.days) || body.days.length !== 7)
    throw new AppError("Revisa las horas: usa el formato 08:00.");
  const fields: Record<string, unknown> = {};
  body.days.forEach((day: unknown, i: number) => {
    const d = (day && typeof day === "object" ? day : {}) as Record<string, unknown>;
    if (d.open === true) fields["open_" + i] = "on";
    fields["from_" + i] = typeof d.from === "string" ? d.from : "";
    fields["to_" + i] = typeof d.to === "string" ? d.to : "";
  });
  const result = await runAction(saveHours, fields);
  return { message: result.success };
});

export const OPTIONS = appOptions;
