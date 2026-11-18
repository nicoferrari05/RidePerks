import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { saveMerchantInfo } from "@/lib/platform/business-actions";

// Información del comercio: the web's own saveMerchantInfo (name, address
// and category changes wait for RidePerks review).
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  const result = await runAction(saveMerchantInfo, {
    name: body.name,
    description: body.description,
    address: body.address,
    phone: body.phone,
    category: body.category,
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
