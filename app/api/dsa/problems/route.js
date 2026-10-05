import { queryDsaProblems } from "@/lib/dsa";

// DSA list ke pages yahan se LAZILY aate hain. Poori list (~220 KB) har page
// load par bhejne ke bajaye, sirf current page ka data jaata hai -- isliye
// topic switch / search / page change turant hota hai aur pehla load halka
// rehta hai. Server-rendered first page bhi isi same function se banta hai
// (app/dsa/page.js), isliye dono kabhi mismatch nahi karte.
//
// Query params: topic, q, diff, part, sort, page, perPage, all, focus
export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const payload = queryDsaProblems({
    topic: sp.get("topic") || "all",
    q: sp.get("q") || "",
    diff: sp.get("diff") || "all",
    part: sp.get("part") || "all",
    sort: sp.get("sort") || "sheet",
    page: sp.get("page") || "1",
    perPage: sp.get("perPage") || "40",
    all: sp.get("all") === "1",
    focus: sp.get("focus") || null,
  });

  return Response.json(payload, {
    headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=86400" },
  });
}