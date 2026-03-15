import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createHelpRequest, resolveHelpRequest } from "../api";
import type { PaginatedResponse } from "./admin";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
	if (typeof window === "undefined") return {};
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface HelpRequest {
	id: string;
	emergencyType: string;
	peopleCount: number;
	description: string | null;
	status: string;
	createdAt: string;
}

async function fetchMyRequestsPaginated(
	page: number,
	limit: number,
): Promise<PaginatedResponse<HelpRequest>> {
	const res = await fetch(
		`${API_URL}/api/help-requests/mine?page=${page}&limit=${limit}`,
		{ headers: authHeaders() },
	);
	if (!res.ok) throw new Error("Failed to fetch requests");
	return res.json();
}

export function useMyRequests(page: number, limit = 5) {
	return useQuery({
		queryKey: ["my-help-requests", page, limit],
		queryFn: () => fetchMyRequestsPaginated(page, limit),
		placeholderData: keepPreviousData,
	});
}

export function useCreateHelpRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createHelpRequest,
		onSuccess: () => {
			toast.success("Help request submitted");
			queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
			queryClient.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}

export function useResolveHelpRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resolveHelpRequest,
		onSuccess: () => {
			toast.success("Request marked as resolved");
			queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
			queryClient.invalidateQueries({ queryKey: ["map-data"] });
		},
		onError: (err) => toast.error(err.message),
	});
}
