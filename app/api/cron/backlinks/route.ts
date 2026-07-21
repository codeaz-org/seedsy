import { NextResponse } from "next/server";
import { matchBacklinks } from "@/lib/backlinks";
import { IS_CLOUD } from "@/lib/mode";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Nightly: pair topically-related projects across accounts for link exchange.
export async function GET(req: Request) {
  if (!IS_CLOUD) {
    return NextResponse.json({ skipped: "backlink network is cloud-only" });
  }
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const created = await matchBacklinks();
  return NextResponse.json({ created });
}
