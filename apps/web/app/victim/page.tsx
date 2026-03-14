"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useSearchParam } from "@/lib/useSearchParam";
import { useMyRequests, useCreateHelpRequest, useResolveHelpRequest } from "@/lib/queries/helpRequests";
import { useRescueStatus } from "@/lib/queries/rescue";
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
import dynamic from "next/dynamic";

const LocationPickerModal = dynamic(() => import("@/components/LocationPickerModal"), { ssr: false });
const ChatPanel = dynamic(() => import("@/components/ChatPanel"), { ssr: false });

const EMERGENCY_TYPES = ["medical", "flood", "fire", "earthquake", "other"] as const;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  assigned: "secondary",
  in_progress: "default",
  resolved: "secondary",
};

export default function VictimPage() {
  const { isAuthorized } = useAuthGuard(["victim"]);
  const [tab, setTab] = useSearchParam("tab", "request");
  const [reqPage, setReqPage] = useState(0);
  const { data: reqData, isLoading } = useMyRequests(reqPage);
  const requests = reqData?.data ?? [];
  const createMutation = useCreateHelpRequest();
  const resolveMutation = useResolveHelpRequest();
  const { data: rescueStatuses = [], isLoading: rescueLoading } = useRescueStatus();

  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [emergencyType, setEmergencyType] = useState<string>("medical");
  const [peopleCount, setPeopleCount] = useState("1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

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
          setReqPage(0);
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  const activeRescues = rescueStatuses.filter((r) => r.status !== "resolved");

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-3xl space-y-6 p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
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
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <div className="flex items-center gap-2">
                        <LocationPickerModal
                          latitude={latitude}
                          longitude={longitude}
                          onSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                          Detect my location
                        </Button>
                      </div>
                    </div>

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
                  ) : requests.length === 0 && reqPage === 0 ? (
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
                      {(reqData?.totalPages ?? 1) > 1 && (
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-muted-foreground">{reqData?.total ?? 0} total</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => setReqPage((p) => p - 1)} disabled={reqPage <= 0}>Previous</Button>
                            <span className="text-sm text-muted-foreground">{reqPage + 1} / {reqData?.totalPages ?? 1}</span>
                            <Button size="sm" variant="outline" onClick={() => setReqPage((p) => p + 1)} disabled={reqPage >= (reqData?.totalPages ?? 1) - 1}>Next</Button>
                          </div>
                        </div>
                      )}
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
            <ChatPanel
              title="AI Emergency Assistant"
              description="Get immediate guidance for your emergency situation."
              emptyMessage="Describe your emergency situation and get immediate guidance."
              emergencyType={emergencyType}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
