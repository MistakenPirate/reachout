"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useVolunteerProfile, useUpdateVolunteerProfile } from "@/lib/queries/volunteer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const LocationPickerModal = dynamic(() => import("@/components/LocationPickerModal"), { ssr: false });

const ALL_SKILLS = ["medical", "search_rescue", "transport", "food", "shelter"] as const;

export default function VolunteerPage() {
  const { data: profile, isLoading } = useVolunteerProfile();
  const updateMutation = useUpdateVolunteerProfile();

  const [skills, setSkills] = useState<string[]>([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saved, setSaved] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (profile) {
      setSkills(profile.skills || []);
      if (profile.latitude != null) setLatitude(String(profile.latitude));
      if (profile.longitude != null) setLongitude(String(profile.longitude));
      setIsAvailable(profile.isAvailable);
      // Mark hydrated after state is set
      setTimeout(() => { hydrated.current = true; }, 0);
    }
  }, [profile]);

  const save = useCallback(
    (patch: { skills?: string[]; latitude?: number; longitude?: number; isAvailable?: boolean }) => {
      if (!hydrated.current) return;
      setSaved(false);
      updateMutation.mutate(patch, {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        },
      });
    },
    [updateMutation],
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = String(pos.coords.latitude);
        const lng = String(pos.coords.longitude);
        setLatitude(lat);
        setLongitude(lng);
        save({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center p-12 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Volunteer Profile</CardTitle>
                <CardDescription>Set your skills, location, and availability to get matched with disaster zones.</CardDescription>
              </div>
              {updateMutation.isPending && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
              {saved && (
                <span className="text-xs text-green-600">Saved</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Availability */}
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

            {/* Skills */}
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

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex items-center gap-2">
                <LocationPickerModal
                  latitude={latitude}
                  longitude={longitude}
                  onSelect={handleLocationSelect}
                />
                <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                  Detect my location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
