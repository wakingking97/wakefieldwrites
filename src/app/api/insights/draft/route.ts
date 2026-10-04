import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { validateInsightInput } from "@/lib/insights";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase-service";

// Machine-to-machine endpoint for the weekly automated draft. Not linked
// from anywhere. Authenticates with a shared bearer secret
// (INSIGHTS_DRAFT_API_KEY) and inserts with the service-role client, which
// bypasses RLS -- there is deliberately no anon/authenticated path for it.
// Inserts are always status = 'draft'; only an admin can publish.

function authorized(request: NextRequest): boolean {
  const expected = process.env.INSIGHTS_DRAFT_API_KEY;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) return false;
  // Hash both sides so timingSafeEqual gets equal-length buffers.
  const a = createHash("sha256").update(match[1]).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  if (!isSupabaseServiceConfigured) {
    console.error("insights draft: Supabase service role not configured");
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "body must be a JSON object" }, { status: 400 });
  }

  const result = validateInsightInput(body as Record<string, unknown>);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("insights")
    .insert({ ...result.value, status: "draft" })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "slug already exists", slug: result.value.slug },
        { status: 409 },
      );
    }
    console.error("insights draft: insert failed", error);
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, slug: data.slug, status: "draft" }, { status: 201 });
}
