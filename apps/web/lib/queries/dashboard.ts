import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DashboardSummary {
  totalActiveDisasters: number;
  pendingRequests: number;
  assignedRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  availableVolunteers: number;
  onMissionVolunteers: number;
  totalResources: number;
}

export interface DashboardRequest {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
  peopleCount: number;
  description: string | null;
  status: string;
  priorityScore: number | null;
  assignedVolunteerId: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string | null;
}

export interface DashboardVolunteer {
  id: string;
  userId: string;
  skills: string[];
  latitude: number | null;
  longitude: number | null;
  status: string;
  isAvailable: boolean;
  userName: string | null;
}

export interface DashboardResource {
  id: string;
  type: string;
  name: string;
  quantity: number;
  latitude: number;
  longitude: number;
  status: string;
}

export interface DashboardZone {
  id: string;
  name: string;
  severity: string;
  type: string;
  status: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  zones: DashboardZone[];
  requests: DashboardRequest[];
  volunteers: DashboardVolunteer[];
  resources: DashboardResource[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/api/dashboard/admin`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 15000,
  });
}
