import {
  AppError,
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { closeOwnAccount } from "@/lib/platform/self-service";

// Eliminar cuenta: same checks as the web (password again, explicit
// confirmation). The login is banned at once, so this phone's session
// can't be renewed; the app forgets it.
export const POST = appRoute(async (request) => {
  const p = await requireAppProfile();
  const body = await readBody(request);
  const result = await closeOwnAccount(p, body.password, body.confirm === true);
  if (result.error) throw new AppError(result.error);
  return { message: result.success };
});

export const OPTIONS = appOptions;
