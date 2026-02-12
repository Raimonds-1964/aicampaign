export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Re-export the real generator so /api/generate and /api/ai/generate behave identically
export { GET, POST } from "../ai/generate/route";
