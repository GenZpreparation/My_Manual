import { getSearchIndex } from "@/lib/tracks";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(getSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
