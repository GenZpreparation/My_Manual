import { getAllModuleParams, getModuleQuestions } from "@/lib/tracks";

// Har (track, module) ka static JSON build time pe ban jaata hai -- lazy loading yahi se hoti hai.
export const dynamicParams = true; // unknown slug/id neeche 404 deta hai
export const generateStaticParams = () => getAllModuleParams();

export async function GET(_req, { params }) {
  const questions = getModuleQuestions(params.slug, params.id);
  if (!questions) return new Response("Not found", { status: 404 });
  return Response.json(questions, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
