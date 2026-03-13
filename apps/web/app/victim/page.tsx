"use client";

import { useState, useRef, useEffect } from "react";
import { useMyRequests, useCreateHelpRequest, useResolveHelpRequest } from "@/lib/queries/helpRequests";
import { useRescueStatus } from "@/lib/queries/rescue";
import { useChatbot, type ChatMessage } from "@/lib/queries/ai";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EMERGENCY_TYPES = ["medical", "flood", "fire", "earthquake", "other"] as const;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  assigned: "secondary",
  in_progress: "default",
  resolved: "secondary",
};

export default function VictimPage() {
  const { data: requests = [], isLoading } = useMyRequests();
  const createMutation = useCreateHelpRequest();
  const resolveMutation = useResolveHelpRequest();
  const { data: rescueStatuses = [], isLoading: rescueLoading } = useRescueStatus();
  const chatMutation = useChatbot();

  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [emergencyType, setEmergencyType] = useState<string>("medical");
  const [peopleCount, setPeopleCount] = useState("1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
      },
      () => setError("Could not detect location. Please enter manually."),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!latitude || !longitude) {
      setError("Location is required");
      return;
    }
    setError("");
    createMutation.mutate(
      {
        latitude: Number(latitude),
        longitude: Number(longitude),
        emergencyType,
        peopleCount: Number(peopleCount),
        description: description || undefined,
      },
      {
        onSuccess: () => {
          setDescription("");
          setPeopleCount("1");
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatInput("");
    chatMutation.mutate(
      { messages: updatedMessages, emergencyType },
      {
        onSuccess: (reply) => {
          setMessages((prev) => [...prev, reply]);
        },
      },
    );
  }

  // Active (non-resolved) requests that have rescue info
  const activeRescues = rescueStatuses.filter((r) => r.status !== "resolved");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-3xl space-y-6 p-6">
        <Tabs defaultValue="request">
          <TabsList>
            <TabsTrigger value="request">Request Help</TabsTrigger>
            <TabsTrigger value="status">Rescue Status</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Tab 1: Request Help + My Requests */}
          <TabsContent value="request">
            <div className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Request Help</CardTitle>
                  <CardDescription>
                    Submit your location and emergency details so rescuers can find you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="lat">Latitude</Label>
                        <Input id="lat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required placeholder="20.5937" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lng">Longitude</Label>
                        <Input id="lng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required placeholder="78.9629" />
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                      Detect my location
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor="type">Emergency Type</Label>
                      <Select value={emergencyType} onValueChange={(v) => v && setEmergencyType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EMERGENCY_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="people">Number of People</Label>
                      <Input id="people" type="number" min={1} value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desc">Description (optional)</Label>
                      <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your situation..." rows={3} />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" variant="destructive" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Submitting..." : "Submit Help Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : requests.length === 0 ? (
                    <p className="text-muted-foreground">No requests yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{req.emergencyType}</span>
                              <Badge variant={statusVariant[req.status] || "outline"}>
                                {req.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {req.peopleCount} people &middot; {new Date(req.createdAt).toLocaleString()}
                            </p>
                            {req.description && (
                              <p className="text-sm text-muted-foreground">{req.description}</p>
                            )}
                          </div>
                          {req.status !== "resolved" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => resolveMutation.mutate(req.id)}
                              disabled={resolveMutation.isPending}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Rescue Status Tracking */}
          <TabsContent value="status">
            <div className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rescue Status</CardTitle>
                  <CardDescription>
                    Track the status of your active rescue requests in real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rescueLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : activeRescues.length === 0 ? (
                    <p className="text-muted-foreground">No active rescue operations.</p>
                  ) : (
                    <div className="space-y-4">
                      {activeRescues.map((rescue) => (
                        <div key={rescue.id} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{rescue.emergencyType}</span>
                              <Badge variant={statusVariant[rescue.status] || "outline"}>
                                {rescue.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(rescue.updatedAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {rescue.peopleCount} people
                            {rescue.description ? ` — ${rescue.description}` : ""}
                          </p>

                          {rescue.volunteer ? (
                            <>
                              <Separator />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Assigned Volunteer</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                  <span>Name: {rescue.volunteer.name}</span>
                                  <span>Phone: {rescue.volunteer.phone}</span>
                                  {rescue.volunteer.distance !== null && (
                                    <span>Distance: {rescue.volunteer.distance.toFixed(1)} km</span>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Waiting for volunteer assignment...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: AI Chatbot */}
          <TabsContent value="chat">
            <div className="pt-4">
              <Card className="flex flex-col" style={{ height: "70vh" }}>
                <CardHeader className="shrink-0">
                  <CardTitle>AI Emergency Assistant</CardTitle>
                  <CardDescription>
                    Get immediate guidance for your emergency situation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                    {messages.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Describe your emergency situation and get immediate guidance.
                      </p>
                    )}
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="rounded-lg px-3 py-2 bg-muted text-sm text-muted-foreground">
                          Thinking...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleChat} className="flex gap-2 shrink-0">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={chatMutation.isPending}
                    />
                    <Button type="submit" disabled={chatMutation.isPending || !chatInput.trim()}>
                      Send
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
