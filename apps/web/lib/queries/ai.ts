import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PriorityResult, DamageSummary, ChatMessage } from "@repo/shared/schemas";

export type { PriorityResult, DamageSummary, ChatMessage };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function runPrioritization(): Promise<PriorityResult[]> {
  const res = await fetch(`${API_URL}/api/ai/prioritize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to run prioritization");
  return res.json();
}

export function usePrioritize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runPrioritization,
    onSuccess: () => {
      toast.success("Prioritization complete");
      qc.invalidateQueries({ queryKey: ["admin-pending-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => toast.error(err.message),
  });
}

// AI Social Media Summary
async function fetchSummary(keyword: string): Promise<DamageSummary> {
  const res = await fetch(`${API_URL}/api/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ keyword }),
  });
  if (!res.ok) throw new Error("Failed to get summary");
  return res.json();
}

export function useSocialMediaSummary() {
  return useMutation({
    mutationFn: fetchSummary,
    onError: (err) => toast.error(err.message),
  });
}

// AI Chatbot
async function sendChat(data: { messages: ChatMessage[]; emergencyType?: string }): Promise<ChatMessage> {
  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to get response");
  return res.json();
}

export function useChatbot() {
  return useMutation({ mutationFn: sendChat });
}
