const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchMapData() {
  const res = await fetch(`${API_URL}/api/disaster/map`);
  if (!res.ok) throw new Error("Failed to fetch map data");
  return res.json();
}

export function createWebSocket(): WebSocket {
  const wsUrl = API_URL.replace(/^http/, "ws");
  return new WebSocket(wsUrl);
}
