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

interface SearchResult {
  snippet: string;
  url: string;
}

function decodeEntities(str: string) {
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/<[^>]*>/g, "").trim();
}

async function webSearch(query: string, timeRange = "w"): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&df=${timeRange}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReachOut/1.0)" },
    });
    const html = await res.text();

    const results: SearchResult[] = [];
    const resultRegex = /class="result__url"[^>]*href="([^"]*)"[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < 8) {
      const rawUrl = decodeEntities(match[1]!);
      const snippet = decodeEntities(match[2]!);
      if (snippet.length > 20) {
        const finalUrl = rawUrl.startsWith("//duckduckgo.com/l/?uddg=")
          ? decodeURIComponent(rawUrl.replace("//duckduckgo.com/l/?uddg=", "").split("&")[0]!)
          : rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
        results.push({ snippet, url: finalUrl });
      }
    }
    return results;
  } catch (err) {
    console.error("[webSearch] error:", err);
    return [];
  }
}

export async function summarizeSocialMedia(keyword: string, timeRange = "w"): Promise<DamageSummary> {
  const searchResults = await webSearch(`${keyword} disaster damage report latest news`, timeRange);

  const searchContext = searchResults.length > 0
    ? `Here are real web search results about "${keyword}":\n${searchResults.map((r, i) => `${i + 1}. ${r.snippet}`).join("\n")}\n\n`
    : "";

  const prompt = `You are a disaster response analyst. Analyze the following web search results about "${keyword}" and provide a damage assessment summary based on the real information found.

${searchContext}Based on the search results above${searchResults.length === 0 ? " (no results found, use your general knowledge)" : ""}, provide a damage assessment. Respond ONLY with a JSON object with these fields:
- affectedAreas: string[] (3-5 specific area names mentioned or relevant)
- estimatedDamageLevel: string ("Minor" | "Moderate" | "Severe" | "Critical")
- keyNeeds: string[] (4-6 priority needs)
- sentiment: string (overall public sentiment in one line)
- summary: string (2-3 sentence overview based on the search results)`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as DamageSummary;
  parsed.sources = searchResults.map((r) => ({ snippet: r.snippet, url: r.url }));
  return parsed;
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
