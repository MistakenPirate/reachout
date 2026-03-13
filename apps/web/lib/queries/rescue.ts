import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface RescueStatus {
  id: string;
  emergencyType: string;
  peopleCount: number;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  volunteer: {
    name: string;
    phone: string;
    distance: number | null;
  } | null;
}

async function fetchRescueStatus(): Promise<RescueStatus[]> {
  const res = await fetch(`${API_URL}/api/dashboard/rescue-status`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch rescue status");
  return res.json();
}

export function useRescueStatus() {
  return useQuery({
    queryKey: ["rescue-status"],
    queryFn: fetchRescueStatus,
    refetchInterval: 10000,
  });
}
