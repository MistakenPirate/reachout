import Groq from "groq-sdk";
import type { PriorityResult, DamageSummary, ChatMessage } from "@repo/shared/schemas";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const MODEL = "llama-3.3-70b-versatile";

export async function prioritizeRequests(
  requests: { id: string; emergencyType: string; peopleCount: number; createdAt: Date }[],
): Promise<PriorityResult[]> {
  const prompt = `You are a disaster response AI. Prioritize the following help requests on a scale of 1-10 (10 = most urgent).

Requests:
${requests.map((r, i) => `${i + 1}. ID: ${r.id} | Type: ${r.emergencyType} | People: ${r.peopleCount} | Created: ${r.createdAt}`).join("\n")}

Respond ONLY with a JSON array of objects with these fields: requestId, score, reasoning.
Example: [{"requestId": "abc", "score": 9, "reasoning": "Medical emergency with 5 people, high urgency"}]`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "[]";
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.results ?? parsed.priorities ?? [];
}

export async function summarizeSocialMedia(keyword: string): Promise<DamageSummary> {
  const prompt = `You are a disaster response analyst. Simulate an analysis of social media posts related to "${keyword}" during a disaster scenario.

Provide a realistic damage assessment summary. Respond ONLY with a JSON object with these fields:
- affectedAreas: string[] (3-5 specific area names)
- estimatedDamageLevel: string ("Minor" | "Moderate" | "Severe" | "Critical")
- keyNeeds: string[] (4-6 priority needs)
- sentiment: string (overall public sentiment in one line)
- summary: string (2-3 sentence overview)`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as DamageSummary;
}

export async function chatWithVictim(
  messages: ChatMessage[],
  emergencyType?: string,
): Promise<string> {
  const systemPrompt = `You are an emergency response assistant helping disaster victims stay safe. Be calm, clear, and concise. Provide actionable safety guidance.${emergencyType ? ` The user is experiencing a ${emergencyType} emergency.` : ""} Keep responses under 200 words. Focus on immediate safety, first aid, evacuation, and signaling for help.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";
}
