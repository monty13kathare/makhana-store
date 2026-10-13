import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * On-demand cache refresh, called by the API after content changes (e.g. a
 * review is approved) so shoppers see it now instead of after the ISR window.
 *
 *   POST /api/revalidate
 *   Authorization: Bearer <REVALIDATE_SECRET>
 *   { "tags": ["reviews", "products"] }
 */

// The tags server.ts assigns to its fetches; anything else is ignored.
const KNOWN_TAGS = new Set(["products", "bundles", "shipping", "config", "reviews", "content"]);

function authorized(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });

  let tags: string[] = [];
  try {
    const body = (await req.json()) as { tags?: unknown };
    if (Array.isArray(body.tags)) tags = body.tags.filter((t): t is string => typeof t === "string" && KNOWN_TAGS.has(t));
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  if (tags.length === 0) return Response.json({ error: "no_known_tags" }, { status: 400 });

  // expire: 0 — the next visitor gets fresh data, not one more stale render.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  // The home page is ISR; refresh it too so the new HTML is built on the next visit.
  revalidatePath("/");

  return Response.json({ revalidated: tags, at: new Date().toISOString() });
}
