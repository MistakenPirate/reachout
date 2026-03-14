"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useSearchParam } from "@/lib/useSearchParam";
import { useVolunteerProfile, useUpdateVolunteerProfile, useVolunteerMissions, useUpdateMissionStatus } from "@/lib/queries/volunteer";
import { useMapData } from "@/lib/queries/map";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

const LocationPickerModal = dynamic(() => import("@/components/LocationPickerModal"), { ssr: false });
const DisasterMap = dynamic(() => import("@/components/DisasterMap"), { ssr: false });
const ChatPanel = dynamic(() => import("@/components/ChatPanel"), { ssr: false });

const ALL_SKILLS = ["medical", "search_rescue", "transport", "food", "shelter"] as const;

export default function VolunteerPage() {
  const { isAuthorized } = useAuthGuard(["volunteer"]);
  const [tab, setTab] = useSearchParam("tab", "profile");

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-4xl p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfilePanel />
          </TabsContent>

          <TabsContent value="missions">
            <MissionsPanel />
          </TabsContent>

          <TabsContent value="chat">
            <ChatPanel
              description="Get guidance on emergency response, first aid, and safety procedures."
              emptyMessage="Ask about emergency procedures, first aid, or disaster response best practices."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfilePanel() {
  const { data: profile, isLoading } = useVolunteerProfile();
  const updateMutation = useUpdateVolunteerProfile();

  const [skills, setSkills] = useState<string[]>([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile) {
      setSkills(profile.skills || []);
      if (profile.latitude != null) setLatitude(String(profile.latitude));
      if (profile.longitude != null) setLongitude(String(profile.longitude));
      setIsAvailable(profile.isAvailable);
      setHydrated(true);
    }
  }, [profile]);

  const save = useCallback(
    (patch: { skills?: string[]; latitude?: number; longitude?: number; isAvailable?: boolean }) => {
      if (!hydrated) return;
      setSaved(false);
      updateMutation.mutate(patch, {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        },
      });
    },
    [hydrated, updateMutation],
  );

  function toggleSkill(skill: string) {
    const next = skills.includes(skill) ? skills.filter((s) => s !== skill) : [...skills, skill];
    setSkills(next);
    save({ skills: next });
  }

  function handleAvailability() {
    const next = !isAvailable;
    setIsAvailable(next);
    save({ isAvailable: next });
  }

  function handleLocationSelect(lat: string, lng: string) {
    setLatitude(lat);
    setLongitude(lng);
    save({ latitude: Number(lat), longitude: Number(lng) });
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = String(pos.coords.latitude);
      const lng = String(pos.coords.longitude);
      setLatitude(lat);
      setLongitude(lng);
      save({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    });
  }

  if (isLoading) return <p className="text-muted-foreground p-4">Loading...</p>;

  return (
    <div className="pt-4 max-w-xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Volunteer Profile</CardTitle>
              <CardDescription>Set your skills, location, and availability to get matched with disaster zones.</CardDescription>
            </div>
            {updateMutation.isPending && <span className="text-xs text-muted-foreground">Saving...</span>}
            {saved && <span className="text-xs text-green-600">Saved</span>}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <Label>Availability</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={isAvailable ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100" : "border-gray-300 text-gray-500 hover:bg-gray-100"}
              onClick={handleAvailability}
            >
              {isAvailable ? "Ready to Help" : "Not Available"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant={skills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex items-center gap-2">
              <LocationPickerModal latitude={latitude} longitude={longitude} onSelect={handleLocationSelect} />
              <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                Detect my location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Completed",
  pending: "Pending",
};

function MissionsPanel() {
  const { data: missions = [], isLoading } = useVolunteerMissions();
  const updateStatus = useUpdateMissionStatus();
  const { data: mapData } = useMapData();

  const [activeMissions, completedMissions] = useMemo(() => {
    const active = missions.filter((m) => m.status !== "resolved");
    const completed = missions.filter((m) => m.status === "resolved");
    return [active, completed] as const;
  }, [missions]);

  return (
    <div className="space-y-6 pt-4">
      {/* Map showing nearby requests */}
      <Card>
        <CardHeader>
          <CardTitle>Area Map</CardTitle>
          <CardDescription>See help requests, volunteers, and resources nearby.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-md overflow-hidden relative z-0">
            <DisasterMap data={mapData ?? { zones: [], helpRequests: [], volunteers: [], resources: [] }} />
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Missions ({activeMissions.length})</CardTitle>
          <CardDescription>Help requests assigned to you.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : activeMissions.length === 0 ? (
            <p className="text-muted-foreground">No active missions. You'll be notified when assigned.</p>
          ) : (
            <div className="space-y-3">
              {activeMissions.map((mission) => (
                <div key={mission.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{mission.emergencyType}</span>
                      <Badge variant={mission.status === "in_progress" ? "default" : "secondary"}>
                        {statusLabels[mission.status] ?? mission.status}
                      </Badge>
                      {mission.priorityScore != null && (
                        <Badge variant="destructive">P{mission.priorityScore}</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(mission.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {mission.peopleCount} people{mission.description ? ` — ${mission.description}` : ""}
                  </p>

                  {mission.userName && (
                    <p className="text-sm">
                      Victim: <span className="font-medium">{mission.userName}</span>
                      {mission.userPhone && <span className="text-muted-foreground"> ({mission.userPhone})</span>}
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Location: {mission.latitude.toFixed(4)}, {mission.longitude.toFixed(4)}
                  </p>

                  <div className="flex gap-2">
                    {mission.status === "assigned" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: mission.id, status: "in_progress" })}
                        disabled={updateStatus.isPending}
                      >
                        Start Mission
                      </Button>
                    )}
                    {mission.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus.mutate({ id: mission.id, status: "resolved" })}
                        disabled={updateStatus.isPending}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed ({completedMissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedMissions.map((mission) => (
                <div key={mission.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{mission.emergencyType}</span>
                    <span className="text-muted-foreground">— {mission.peopleCount} people</span>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
