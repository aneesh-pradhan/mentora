/**
 * Client for the roadmap API.
 *
 * The original module was never committed. `src/app/page.tsx` expects
 * `generateRoadmap` to resolve to an object with `nodes` and `edges`.
 * That matches the Flask route that used to live in the backend bytecode:
 * POST /generate-roadmap with `{ course_theme, max_depth? }`, returning the
 * orchestration result as JSON. `nodes` is required; `edges` defaults to []
 * when the server omits it.
 */

export interface RoadmapNode {
  id: string;
  [key: string]: unknown;
}

export interface RoadmapEdge {
  id?: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

export interface GenerateRoadmapResult {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  [key: string]: unknown;
}

function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  return configured.replace(/\/$/, "");
}

function errorMessage(payload: unknown, status: number): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.length > 0
  ) {
    return payload.error;
  }
  return `Roadmap request failed (${status})`;
}

export async function generateRoadmap(
  courseTheme: string,
  maxDepth = 2
): Promise<GenerateRoadmapResult> {
  const response = await fetch(`${apiBaseUrl()}/generate-roadmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_theme: courseTheme,
      max_depth: maxDepth,
    }),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status));
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Roadmap response was not JSON");
  }

  const data = payload as { nodes?: unknown; edges?: unknown };
  if (!Array.isArray(data.nodes)) {
    throw new Error("Roadmap response is missing a nodes array");
  }

  return {
    ...(payload as Record<string, unknown>),
    nodes: data.nodes as RoadmapNode[],
    edges: Array.isArray(data.edges) ? (data.edges as RoadmapEdge[]) : [],
  };
}
