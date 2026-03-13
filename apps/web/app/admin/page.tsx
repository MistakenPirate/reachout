"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePendingRequests,
  useSuggestedVolunteers,
  useAssignVolunteer,
  useCreateZone,
  useCreateResource,
  useAllocateResource,
} from "@/lib/queries/admin";
import { useAdminDashboard } from "@/lib/queries/dashboard";
import { usePrioritize, useSocialMediaSummary, type DamageSummary } from "@/lib/queries/ai";
import { useMapData } from "@/lib/queries/map";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Coordination Panel</h1>
        <OverviewCards />
        <Tabs defaultValue="requests" className="mt-6">
          <TabsList>
            <TabsTrigger value="requests">Help Requests</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="zones">Disaster Zones</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="ai">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4"><RequestsPanel /></TabsContent>
          <TabsContent value="volunteers" className="mt-4"><VolunteersPanel /></TabsContent>
          <TabsContent value="zones" className="mt-4"><ZonesPanel /></TabsContent>
          <TabsContent value="resources" className="mt-4"><ResourcesPanel /></TabsContent>
          <TabsContent value="ai" className="mt-4"><AIPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewCards() {
  const { data } = useAdminDashboard();
  if (!data) return null;
  const s = data.summary;

  const cards = [
    { label: "Active Disasters", value: s.totalActiveDisasters, color: "text-red-600" },
    { label: "Pending Requests", value: s.pendingRequests, color: "text-amber-600" },
    { label: "In Progress", value: s.inProgressRequests, color: "text-blue-600" },
    { label: "Available Volunteers", value: s.availableVolunteers, color: "text-green-600" },
    { label: "On Mission", value: s.onMissionVolunteers, color: "text-purple-600" },
    { label: "Total Resources", value: s.totalResources, color: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RequestsPanel() {
  const { data: requests = [], isLoading } = usePendingRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { data: volunteers = [] } = useSuggestedVolunteers(selectedRequestId);
  const assignMutation = useAssignVolunteer();
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data: dashData } = useAdminDashboard();
  const allRequests = dashData?.requests ?? [];
  const filtered = statusFilter === "all" ? allRequests : allRequests.filter((r) => r.status === statusFilter);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Filter by status:</Label>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 && <p className="text-muted-foreground">No requests found.</p>}
          {filtered.map((req) => (
            <Card
              key={req.id}
              className={`cursor-pointer transition-colors ${selectedRequestId === req.id ? "border-primary" : ""}`}
              onClick={() => req.status === "pending" && setSelectedRequestId(req.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{req.emergencyType}</span>
                    {req.priorityScore != null && (
                      <Badge variant="destructive">P{req.priorityScore}</Badge>
                    )}
                  </div>
                  <Badge variant="outline">{req.status.replace("_", " ")}</Badge>
                </div>
                {req.userName && <p className="text-sm text-muted-foreground">From: {req.userName}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {req.peopleCount} people &middot; {new Date(req.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            {selectedRequestId ? "Suggested Volunteers" : "Select a pending request to assign"}
          </h3>
          {selectedRequestId && volunteers.length === 0 && (
            <p className="text-muted-foreground text-sm">No available volunteers nearby.</p>
          )}
          <div className="space-y-2">
            {volunteers.map((vol) => (
              <Card key={vol.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vol.userName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {vol.distance.toFixed(1)} km &middot; {vol.skills.join(", ") || "No skills"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      assignMutation.mutate({ requestId: selectedRequestId!, volunteerUserId: vol.userId });
                    }}
                    disabled={assignMutation.isPending}
                  >
                    Assign
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VolunteersPanel() {
  const { data: dashData } = useAdminDashboard();
  const volunteers = dashData?.volunteers ?? [];
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? volunteers
    : filter === "available"
      ? volunteers.filter((v) => v.isAvailable)
      : volunteers.filter((v) => v.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Filter:</Label>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_mission">On Mission</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} volunteers</span>
      </div>
      <div className="space-y-2">
        {filtered.map((vol) => (
          <div key={vol.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{vol.userName || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">
                Skills: {vol.skills.length > 0 ? vol.skills.join(", ") : "None"} &middot;
                {vol.latitude != null ? ` ${vol.latitude.toFixed(2)}, ${vol.longitude?.toFixed(2)}` : " No location"}
              </p>
            </div>
            <Badge variant={vol.isAvailable ? "default" : "secondary"}>
              {vol.status.replace("_", " ")}
            </Badge>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">No volunteers found.</p>}
      </div>
    </div>
  );
}

function ZonesPanel() {
  const createZone = useCreateZone();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusKm, setRadiusKm] = useState("5");
  const [severity, setSeverity] = useState("medium");
  const [type, setType] = useState("other");

  const { data: dashData } = useAdminDashboard();
  const zones = dashData?.zones ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createZone.mutate(
      { name, description: description || undefined, latitude: Number(latitude), longitude: Number(longitude), radiusKm: Number(radiusKm), severity, type },
      { onSuccess: () => { setName(""); setDescription(""); setLatitude(""); setLongitude(""); setRadiusKm("5"); } },
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Disaster Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="zname">Zone Name</Label>
                <Input id="zname" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Chennai Flood Zone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zdesc">Description</Label>
                <Input id="zdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label htmlFor="zlat">Latitude</Label><Input id="zlat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="zlng">Longitude</Label><Input id="zlng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="zrad">Radius (km)</Label><Input id="zrad" type="number" step="any" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={(v) => v && setSeverity(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="medical">Medical</SelectItem><SelectItem value="flood">Flood</SelectItem><SelectItem value="fire">Fire</SelectItem><SelectItem value="earthquake">Earthquake</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
              </div>
            </div>
            <Button type="submit" disabled={createZone.isPending}>{createZone.isPending ? "Creating..." : "Create Zone"}</Button>
          </form>
        </CardContent>
      </Card>

      {zones.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active Zones</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {zones.map((z) => (
                <div key={z.id} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">{z.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{z.type}</Badge>
                    <Badge variant={z.severity === "critical" ? "destructive" : "secondary"}>{z.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResourcesPanel() {
  const { data: mapData } = useMapData();
  const createResource = useCreateResource();
  const allocateMutation = useAllocateResource();
  const [name, setName] = useState("");
  const [type, setType] = useState("food");
  const [quantity, setQuantity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [allocateId, setAllocateId] = useState<string | null>(null);
  const [allocateAmount, setAllocateAmount] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const resources = mapData?.resources ?? [];
  const filtered = typeFilter === "all" ? resources : resources.filter((r) => r.type === typeFilter);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createResource.mutate(
      { type, name, quantity: Number(quantity), latitude: Number(latitude), longitude: Number(longitude) },
      { onSuccess: () => { setName(""); setQuantity(""); setLatitude(""); setLongitude(""); } },
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Add Resource</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="rname">Name</Label><Input id="rname" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Water Unit 1" /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="food">Food</SelectItem><SelectItem value="water">Water</SelectItem><SelectItem value="medical_supplies">Medical Supplies</SelectItem><SelectItem value="shelter_kit">Shelter Kit</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label htmlFor="rqty">Quantity</Label><Input id="rqty" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="rlat">Latitude</Label><Input id="rlat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="rlng">Longitude</Label><Input id="rlng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required /></div>
            </div>
            <Button type="submit" disabled={createResource.isPending}>{createResource.isPending ? "Adding..." : "Add Resource"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Resources</CardTitle>
            <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="medical_supplies">Medical</SelectItem>
                <SelectItem value="shelter_kit">Shelter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No resources.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((res) => (
                <div key={res.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{res.name}</span>
                    <Badge variant="secondary">{res.type.replace("_", " ")}</Badge>
                    <Badge variant={res.quantity > 0 ? "outline" : "destructive"}>Qty: {res.quantity}</Badge>
                  </div>
                  {allocateId === res.id ? (
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={res.quantity} className="w-20" value={allocateAmount} onChange={(e) => setAllocateAmount(e.target.value)} />
                      <Button size="sm" onClick={() => allocateMutation.mutate({ resourceId: res.id, amount: Number(allocateAmount) }, { onSuccess: () => { setAllocateId(null); setAllocateAmount(""); } })} disabled={allocateMutation.isPending || !allocateAmount}>OK</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAllocateId(null)}>X</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setAllocateId(res.id)} disabled={res.quantity <= 0}>Allocate</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AIPanel() {
  const prioritize = usePrioritize();
  const summarize = useSocialMediaSummary();
  const [keyword, setKeyword] = useState("");
  const [summary, setSummary] = useState<DamageSummary | null>(null);

  return (
    <div className="space-y-6">
      {/* AI Prioritization */}
      <Card>
        <CardHeader>
          <CardTitle>AI Request Prioritization</CardTitle>
          <CardDescription>Run AI to score and rank all pending help requests by urgency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => prioritize.mutate()} disabled={prioritize.isPending}>
            {prioritize.isPending ? "Running..." : "Run Prioritization"}
          </Button>
          {prioritize.data && prioritize.data.length > 0 && (
            <div className="space-y-2 mt-3">
              {prioritize.data.map((r) => (
                <div key={r.requestId} className="flex items-center gap-3 rounded-lg border p-3">
                  <Badge variant="destructive" className="text-lg px-3">{r.score}</Badge>
                  <p className="text-sm">{r.reasoning}</p>
                </div>
              ))}
            </div>
          )}
          {prioritize.data && prioritize.data.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending requests to prioritize.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Social Media Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI Damage Summarization</CardTitle>
          <CardDescription>Analyze social media posts about a disaster zone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter disaster zone name or keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button
              onClick={() => summarize.mutate(keyword, { onSuccess: (data) => setSummary(data) })}
              disabled={summarize.isPending || !keyword}
            >
              {summarize.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          {summary && (
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Summary</p>
                <p className="text-sm">{summary.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Damage Level</p>
                  <Badge variant="destructive">{summary.estimatedDamageLevel}</Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Sentiment</p>
                  <p>{summary.sentiment}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Affected Areas</p>
                  <ul className="list-disc list-inside">{summary.affectedAreas.map((a) => <li key={a}>{a}</li>)}</ul>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Key Needs</p>
                  <ul className="list-disc list-inside">{summary.keyNeeds.map((n) => <li key={n}>{n}</li>)}</ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
