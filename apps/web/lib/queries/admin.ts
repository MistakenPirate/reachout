import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type {
	PendingRequest,
	SuggestedVolunteer,
	Resource,
	CreateDisasterZoneInput,
	CreateResourceInput,
} from "@repo/shared/schemas";

export type { PendingRequest, SuggestedVolunteer, Resource };

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
	if (typeof window === "undefined") return {};
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fetchers
async function fetchPendingRequests(): Promise<PendingRequest[]> {
	const res = await fetch(`${API_URL}/api/admin/requests/pending`, {
		headers: authHeaders(),
	});
	if (!res.ok) throw new Error("Failed to fetch pending requests");
	return res.json();
}

async function fetchSuggestedVolunteers(
	requestId: string,
): Promise<SuggestedVolunteer[]> {
	const res = await fetch(
		`${API_URL}/api/admin/requests/${requestId}/volunteers`,
		{ headers: authHeaders() },
	);
	if (!res.ok) throw new Error("Failed to fetch volunteers");
	return res.json();
}

async function assignVolunteerToRequest(data: {
	requestId: string;
	volunteerUserId: string;
}) {
	const res = await fetch(
		`${API_URL}/api/admin/requests/${data.requestId}/assign`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders() },
			body: JSON.stringify({ volunteerUserId: data.volunteerUserId }),
		},
	);
	if (!res.ok) {
		const json = await res.json();
		throw new Error(
			typeof json.error === "string" ? json.error : "Failed to assign",
		);
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
	const res = await fetch(
		`${API_URL}/api/admin/resources/${data.resourceId}/allocate`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders() },
			body: JSON.stringify({ amount: data.amount }),
		},
	);
	if (!res.ok) {
		const json = await res.json();
		throw new Error(
			typeof json.error === "string" ? json.error : "Failed to allocate",
		);
	}
	return res.json();
}

async function deleteZone(id: string) {
	const res = await fetch(`${API_URL}/api/admin/zones/${id}`, {
		method: "DELETE",
		headers: authHeaders(),
	});
	if (!res.ok) throw new Error("Failed to delete zone");
	return res.json();
}

async function deleteResource(id: string) {
	const res = await fetch(`${API_URL}/api/admin/resources/${id}`, {
		method: "DELETE",
		headers: authHeaders(),
	});
	if (!res.ok) throw new Error("Failed to delete resource");
	return res.json();
}

async function fetchZonesPaginated(
	page: number,
	limit: number,
): Promise<PaginatedResponse<Record<string, unknown>>> {
	const res = await fetch(
		`${API_URL}/api/admin/zones?page=${page}&limit=${limit}`,
		{ headers: authHeaders() },
	);
	if (!res.ok) throw new Error("Failed to fetch zones");
	return res.json();
}

async function fetchResourcesPaginated(
	page: number,
	limit: number,
): Promise<PaginatedResponse<Record<string, unknown>>> {
	const res = await fetch(
		`${API_URL}/api/admin/resources?page=${page}&limit=${limit}`,
		{ headers: authHeaders() },
	);
	if (!res.ok) throw new Error("Failed to fetch resources");
	return res.json();
}

// Hooks
export function usePendingRequests() {
	return useQuery({
		queryKey: ["admin-pending-requests"],
		queryFn: fetchPendingRequests,
		refetchInterval: 30000,
	});
}

export function useSuggestedVolunteers(requestId: string | null) {
	return useQuery({
		queryKey: ["suggested-volunteers", requestId],
		queryFn: () => fetchSuggestedVolunteers(requestId!),
		enabled: !!requestId,
	});
}

export function useZonesPaginated(page: number, limit = 5) {
	return useQuery({
		queryKey: ["admin-zones", page, limit],
		queryFn: () => fetchZonesPaginated(page, limit),
		placeholderData: keepPreviousData,
	});
}

export function useResourcesPaginated(page: number, limit = 5) {
	return useQuery({
		queryKey: ["admin-resources", page, limit],
		queryFn: () => fetchResourcesPaginated(page, limit),
		placeholderData: keepPreviousData,
	});
}

export function useAssignVolunteer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: assignVolunteerToRequest,
		onSuccess: () => {
			toast.success("Volunteer assigned successfully");
			qc.invalidateQueries({ queryKey: ["admin-pending-requests"] });
			qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
			qc.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}

export function useCreateZone() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createZone,
		onSuccess: () => {
			toast.success("Disaster zone created");
			qc.invalidateQueries({ queryKey: ["admin-zones"] });
			qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
			qc.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}

export function useCreateResource() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createResource,
		onSuccess: () => {
			toast.success("Resource added");
			qc.invalidateQueries({ queryKey: ["admin-resources"] });
			qc.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}

export function useDeleteZone() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteZone,
		onSuccess: () => {
			toast.success("Disaster zone deleted");
			qc.invalidateQueries({ queryKey: ["admin-zones"] });
			qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
			qc.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}

export function useDeleteResource() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteResource,
		onSuccess: () => {
			toast.success("Resource deleted");
			qc.invalidateQueries({ queryKey: ["admin-resources"] });
			qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
			qc.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}

export function useAllocateResource() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: allocateResource,
		onSuccess: () => {
			toast.success("Resource allocated");
			qc.invalidateQueries({ queryKey: ["admin-resources"] });
			qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
			qc.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}
