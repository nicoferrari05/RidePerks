import { NextRequest } from "next/server";
import { requireBusiness } from "@/lib/platform/data";
import { businessCsv } from "@/lib/platform/business-csv";
export const dynamic = "force-dynamic";
// The owner's uses for a period as CSV. Built in lib/platform/business-csv.ts,
// shared with the phone app.
export async function GET(request: NextRequest) {
  const { business, profile, role } = await requireBusiness();
  if (!business || role !== "owner")
    return new Response("No autorizado.", { status: 403 });
  const result = await businessCsv(
    business,
    profile,
    request.nextUrl.searchParams.get("period") || "30",
  );
  if ("error" in result)
    return new Response(result.error, { status: result.status });
  return new Response(result.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + result.name + '"',
      "Cache-Control": "private, no-store",
    },
  });
}
