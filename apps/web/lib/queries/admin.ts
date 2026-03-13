import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PendingRequest, SuggestedVolunteer, Resource, CreateDisasterZoneInput, CreateResourceInput } from "@repo/shared/schemas";

export type { PendingRequest, SuggestedVolunteer, Resource };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fetchers
async function fetchPendingRequests(): Promise<PendingRequest[]> {
  const res = await fetch(`${API_URL}/api/admin/requests/pending`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch pending requests");
  return res.json();
}

async function fetchSuggestedVolunteers(requestId: string): Promise<SuggestedVolunteer[]> {
  const res = await fetch(`${API_URL}/api/admin/requests/${requestId}/volunteers`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch volunteers");
  return res.json();
}

async function assignVolunteerToRequest(data: { requestId: string; volunteerUserId: string }) {
  const res = await fetch(`${API_URL}/api/admin/requests/${data.requestId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ volunteerUserId: data.volunteerUserId }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(typeof json.error === "string" ? json.error : "Failed to assign");
  }
  return res.json();
}

async function createZone(data: CreateDisasterZoneInput) {
  const res = await fetch(`${API_URL}/api/admin/zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create zone");
  return res.json();
}

async function createResource(data: CreateResourceInput) {
  const res = await fetch(`${API_URL}/api/admin/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create resource");
  return res.json();
}

async function allocateResource(data: { resourceId: string; amount: number }) {
  const res = await fetch(`${API_URL}/api/admin/resources/${data.resourceId}/allocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ amount: data.amount }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(typeof json.error === "string" ? json.error : "Failed to allocate");
  }
  return res.json();
}

// Hooks
export function usePendingRequests() {
  return useQuery({ queryKey: ["admin-pending-requests"], queryFn: fetchPendingRequests, refetchInterval: 30000 });
}

export function useSuggestedVolunteers(requestId: string | null) {
  return useQuery({
    queryKey: ["suggested-volunteers", requestId],
    queryFn: () => fetchSuggestedVolunteers(requestId!),
    enabled: !!requestId,
  });
}

export function useAssignVolunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignVolunteerToRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-requests"] });
      qc.invalidateQueries({ queryKey: ["map-data"] });
    },
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createZone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["map-data"] });
    },
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["map-data"] });
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
    },
  });
}

export function useAllocateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: allocateResource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["map-data"] });
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
    },
  });
}
