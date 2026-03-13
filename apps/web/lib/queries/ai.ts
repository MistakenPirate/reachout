import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// AI Prioritization
export interface PriorityResult {
  requestId: string;
  score: number;
  reasoning: string;
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
      qc.invalidateQueries({ queryKey: ["admin-pending-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

// AI Social Media Summary
export interface DamageSummary {
  affectedAreas: string[];
  estimatedDamageLevel: string;
  keyNeeds: string[];
  sentiment: string;
  summary: string;
}

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
  return useMutation({ mutationFn: fetchSummary });
}

// AI Chatbot
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
