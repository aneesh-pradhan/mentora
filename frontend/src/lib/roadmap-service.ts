/**
 * Firestore persistence for generated roadmaps.
 *
 * The original module was never committed. Reconstructed from `src/app/page.tsx`:
 * create a pending document, subscribe to status changes, then write either
 * the generated graph or an error. Documents live in the `roadmaps` collection.
 */
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export type RoadmapStatus = "pending" | "completed" | "error";

export interface RoadmapRecord {
  id: string;
  prompt: string;
  status: RoadmapStatus;
  nodes: unknown[];
  edges: unknown[];
  error?: string;
}

const ROADMAPS = "roadmaps";

export async function createRoadmap(prompt: string): Promise<string> {
  const db = getFirebaseDb();
  const ref = doc(collection(db, ROADMAPS));
  await setDoc(ref, {
    prompt,
    status: "pending" satisfies RoadmapStatus,
    nodes: [],
    edges: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToRoadmap(
  roadmapId: string,
  onChange: (roadmap: RoadmapRecord | null) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(doc(db, ROADMAPS, roadmapId), (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null);
      return;
    }

    const data = snapshot.data();
    const status: RoadmapStatus =
      data.status === "completed" || data.status === "error"
        ? data.status
        : "pending";

    onChange({
      id: snapshot.id,
      prompt: typeof data.prompt === "string" ? data.prompt : "",
      status,
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : [],
      error: typeof data.error === "string" ? data.error : undefined,
    });
  });
}

export async function updateRoadmap(
  roadmapId: string,
  nodes: readonly unknown[],
  edges: readonly unknown[]
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, ROADMAPS, roadmapId), {
    nodes: [...nodes],
    edges: [...edges],
    status: "completed" satisfies RoadmapStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function updateRoadmapError(
  roadmapId: string,
  error: string
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, ROADMAPS, roadmapId), {
    status: "error" satisfies RoadmapStatus,
    error,
    updatedAt: serverTimestamp(),
  });
}
