import { useQuery } from "@tanstack/react-query";
import type { DashboardSummary, DashboardRequest, DashboardVolunteer, DashboardResource, DashboardZone, DashboardData } from "@repo/shared/schemas";

export type { DashboardSummary, DashboardRequest, DashboardVolunteer, DashboardResource, DashboardZone, DashboardData };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
