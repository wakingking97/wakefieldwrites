import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { runInsightsDraftJob } from "@/lib/insightsDraftJob";

// Weekly Insights drafting, invoked by Vercel Cron (see vercel.json).
//
// Schedule "0 6 * * 1" = Monday 06:00 UTC. HSP posts go out Sunday ~11:00
// Mountain (~17:00 UTC), so this runs Sunday night Mountain: 00:00 Monday
// in summer (MDT), 23:00 Sunday in winter (MST). Vercel crons run in UTC,
// and on the Hobby plan fire anywhere within the specified hour (so up to
// 06:59 UTC) and at most once per day. The job is idempotent (it skips posts
// that already have an insight), so a missed or doubled run is harmless.
//
// maxDuration 300s is the Hobby maximum with Fluid compute (also its
// default). One post's web-search + draft call takes roughly 30-90s; the
// job stops starting new posts after 180s so it never gets killed mid-run.
export const maxDuration = 300;

// Vercel sends "Authorization: Bearer $CRON_SECRET" automatically when the
// CRON_SECRET env var is set on the project.
function authorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const match = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "");
  if (!match) return false;
  const a = createHash("sha256").update(match[1]).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return new NextResponse(null, { status: 401 });
  }
  const summary = await runInsightsDraftJob();
  return NextResponse.json(summary, { status: summary.ok ? 200 : 500 });
}
