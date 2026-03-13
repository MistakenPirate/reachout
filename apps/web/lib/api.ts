const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchMapData() {
  const res = await fetch(`${API_URL}/api/disaster/map`);
  if (!res.ok) throw new Error("Failed to fetch map data");
  return res.json();
}

export function createWebSocket(): WebSocket {
  const wsUrl = API_URL.replace(/^http/, "ws");
  return new WebSocket(wsUrl);
}

// -- Auth --

export async function registerUser(data: { name: string; email: string; password: string; phone: string; role: string }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Registration failed");
  return json;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Login failed");
  return json;
}

export async function fetchMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, { headers: authHeaders() });
  if (!res.ok) return null;
  const json = await res.json();
  return json.user;
}

// -- Help Requests --

export async function createHelpRequest(data: {
  latitude: number;
  longitude: number;
  emergencyType: string;
  peopleCount: number;
  description?: string;
}) {
  const res = await fetch(`${API_URL}/api/help-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to create request");
  return json;
}

export async function fetchMyRequests() {
  const res = await fetch(`${API_URL}/api/help-requests/mine`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

export async function resolveHelpRequest(id: string) {
  const res = await fetch(`${API_URL}/api/help-requests/${id}/resolve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to resolve request");
  return json;
}

// -- Volunteers --

export async function fetchVolunteerProfile() {
  const res = await fetch(`${API_URL}/api/volunteers/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateVolunteerProfile(data: {
  skills?: string[];
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
}) {
  const res = await fetch(`${API_URL}/api/volunteers/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to update profile");
  return json;
}
