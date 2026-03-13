// Dummy AI service — replace with real Claude API calls later

export interface PriorityResult {
  requestId: string;
  score: number;
  reasoning: string;
}

export async function prioritizeRequests(
  requests: { id: string; emergencyType: string; peopleCount: number; createdAt: Date }[],
): Promise<PriorityResult[]> {
  // Dummy scoring based on emergency type + people count + age
  const typeWeights: Record<string, number> = {
    medical: 8,
    earthquake: 7,
    fire: 6,
    flood: 5,
    other: 3,
  };

  return requests.map((req) => {
    const typeScore = typeWeights[req.emergencyType] ?? 3;
    const peopleScore = Math.min(req.peopleCount / 5, 2);
    const ageHours = (Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60);
    const ageScore = Math.min(ageHours / 2, 1);
    const score = Math.min(Math.round(typeScore + peopleScore + ageScore), 10);

    const reasonings: Record<string, string> = {
      medical: "Medical emergencies require immediate attention",
      earthquake: "Structural collapse risk — high urgency",
      fire: "Active fire hazard — time-sensitive",
      flood: "Flooding with potential displacement",
      other: "General emergency reported",
    };

    return {
      requestId: req.id,
      score,
      reasoning: `${reasonings[req.emergencyType] || "Emergency reported"} (${req.peopleCount} people, ${ageHours.toFixed(1)}h ago)`,
    };
  });
}

export interface DamageSummary {
  affectedAreas: string[];
  estimatedDamageLevel: string;
  keyNeeds: string[];
  sentiment: string;
  summary: string;
}

export async function summarizeSocialMedia(keyword: string): Promise<DamageSummary> {
  // Dummy response — replace with Claude API call
  return {
    affectedAreas: [`${keyword} central district`, `${keyword} riverside`, `${keyword} east suburbs`],
    estimatedDamageLevel: "Severe",
    keyNeeds: ["Clean drinking water", "Medical supplies", "Temporary shelter", "Search and rescue teams"],
    sentiment: "Urgent — multiple distress reports",
    summary: `Based on social media analysis for "${keyword}": widespread damage reported across 3 areas. Multiple residents reporting flooding, structural damage, and need for evacuation. Emergency services are stretched thin. Priority needs include clean water, medical aid, and temporary shelters.`,
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithVictim(
  messages: ChatMessage[],
  emergencyType?: string,
): Promise<string> {
  // Dummy chatbot response — replace with Claude API call
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  if (lastMessage.includes("first aid") || lastMessage.includes("hurt") || lastMessage.includes("injured")) {
    return "If someone is injured: 1) Apply pressure to any bleeding wounds with clean cloth. 2) Keep the person still and warm. 3) Do NOT move someone with a potential spinal injury. 4) Call emergency services immediately. Note: This is general guidance — please seek professional medical help as soon as possible.";
  }

  if (lastMessage.includes("evacuate") || lastMessage.includes("leave") || lastMessage.includes("escape")) {
    return "For evacuation: 1) Move to higher ground if flooding. 2) Stay away from damaged buildings. 3) Follow marked evacuation routes if available. 4) Take essentials: water, phone, ID, medications. 5) Help others who need assistance but don't put yourself at risk.";
  }

  if (lastMessage.includes("signal") || lastMessage.includes("help") || lastMessage.includes("rescue")) {
    return "To signal for rescue: 1) Use a flashlight or phone screen at night. 2) Create visible markers with bright clothing or sheets. 3) Make noise at regular intervals — whistle, bang on objects. 4) Stay in one visible location if possible. 5) If you have phone signal, share your GPS coordinates.";
  }

  if (lastMessage.includes("water") || lastMessage.includes("drink") || lastMessage.includes("food")) {
    return "For water safety: 1) Only drink sealed bottled water or water you've boiled for 1 minute. 2) Avoid flood water — it may be contaminated. 3) Ration available supplies. For food: eat perishable items first, then move to canned/dried goods.";
  }

  const typeGuidance: Record<string, string> = {
    flood: "Flood safety: Move to the highest point in your building. Do NOT walk through flowing water. 15cm of fast water can knock you down. Avoid electrical equipment. Stay away from rivers and drains.",
    fire: "Fire safety: Stay low — smoke rises. Cover mouth with wet cloth. Feel doors before opening (hot = fire behind). Use stairs, never elevators. If trapped, seal door gaps and signal from window.",
    earthquake: "Earthquake safety: If shaking — DROP, COVER, HOLD ON. Stay under sturdy furniture. After shaking stops, move outside carefully. Watch for aftershocks. Check for gas leaks.",
    medical: "While waiting for medical help: Keep the patient calm and comfortable. Monitor their breathing. If they're conscious, keep them talking. Note their symptoms for when help arrives.",
  };

  if (emergencyType && typeGuidance[emergencyType]) {
    return typeGuidance[emergencyType] + "\n\nHow else can I help you stay safe?";
  }

  return "I'm here to help you stay safe. I can provide guidance on: first aid, evacuation routes, signaling for rescue, water/food safety, or specific emergency types. What do you need help with?";
}
