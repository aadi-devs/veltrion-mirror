// Network node locations shown on the interactive globe.
// Stored locally so staff can edit them from the admin panel without a backend change.
export interface NetworkNode {
  id: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  status: "online" | "maintenance" | "planned";
}

export const DEFAULT_NODES: NetworkNode[] = [
  { id: "nyc", city: "New York", country: "USA", lat: 40.71, lon: -74.01, status: "online" },
  { id: "lax", city: "Los Angeles", country: "USA", lat: 34.05, lon: -118.24, status: "online" },
  { id: "dfw", city: "Dallas", country: "USA", lat: 32.78, lon: -96.8, status: "online" },
  { id: "lon", city: "London", country: "UK", lat: 51.51, lon: -0.13, status: "online" },
  { id: "fra", city: "Frankfurt", country: "Germany", lat: 50.11, lon: 8.68, status: "online" },
  { id: "waw", city: "Warsaw", country: "Poland", lat: 52.23, lon: 21.01, status: "online" },
  { id: "sgp", city: "Singapore", country: "Singapore", lat: 1.35, lon: 103.82, status: "online" },
  { id: "syd", city: "Sydney", country: "Australia", lat: -33.87, lon: 151.21, status: "planned" },
  { id: "mum", city: "Mumbai", country: "India", lat: 19.08, lon: 72.88, status: "online" },
];

const KEY = "anuverse:nodes";
export const NODES_EVENT = "anuverse:nodes-changed";

export function loadNodes(): NetworkNode[] {
  if (typeof window === "undefined") return DEFAULT_NODES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_NODES;
    const parsed = JSON.parse(raw) as NetworkNode[];
    return Array.isArray(parsed) ? parsed : DEFAULT_NODES;
  } catch {
    return DEFAULT_NODES;
  }
}

export function saveNodes(nodes: NetworkNode[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(nodes));
  window.dispatchEvent(new CustomEvent(NODES_EVENT));
}

export function resetNodes() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(NODES_EVENT));
}
