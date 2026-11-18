import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { benefitDetailData } from "@/lib/platform/driver-screens";
import { todayIndex } from "@/lib/platform/hours";

// One benefit, as /driver/benefits/[id] shows it.
export const GET = appRoute(
  async (_request, context: { params: Promise<{ id: string }> }) => {
    const p = await requireAppProfile("driver");
    const d = await benefitDetailData(p, (await context.params).id);
    if (!d) throw new AppError("Este beneficio ya no está disponible.", 404);
    const b = d.benefit;
    return {
      benefit: {
        id: b.id,
        title: b.title,
        description: b.description,
        discount_label: b.discount_label,
        terms: b.terms,
        category: b.category,
        monthly_limit: b.monthly_limit,
        valid_until: b.valid_until,
        business: {
          name: b.rp_businesses.name,
          address: b.rp_businesses.address,
          phone: b.rp_businesses.phone,
        },
      },
      verified: d.verified,
      saved: d.saved,
      logo: d.logo,
      photos: d.photos,
      hours: d.hours,
      status: d.status,
      today: todayIndex(),
    };
  },
);

export const OPTIONS = appOptions;
