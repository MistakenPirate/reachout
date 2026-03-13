"use client";

import { useState, useEffect } from "react";
import { useVolunteerProfile, useUpdateVolunteerProfile } from "@/lib/queries/volunteer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setSkills(profile.skills || []);
      if (profile.latitude != null) setLatitude(String(profile.latitude));
      if (profile.longitude != null) setLongitude(String(profile.longitude));
      setIsAvailable(profile.isAvailable);
    }
  }, [profile]);

  function toggleSkill(skill: string) {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
      },
      () => setError("Could not detect location."),
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    updateMutation.mutate(
      {
        skills,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        isAvailable,
      },
      {
        onSuccess: () => setSuccess("Profile updated successfully"),
        onError: (err) => setError(err.message),
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
            <CardTitle>Volunteer Profile</CardTitle>
            <CardDescription>Set your skills, location, and availability to get matched with disaster zones.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              {/* Availability */}
              <div className="flex items-center justify-between">
                <Label>Availability</Label>
                <Button
                  type="button"
                  variant={isAvailable ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setIsAvailable(!isAvailable)}
                >
                  {isAvailable ? "Available" : "Unavailable"}
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
                    onSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                    Detect my location
                  </Button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={profile.isAvailable ? "default" : "secondary"}>
                  {profile.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skills</span>
                <span>{profile.skills.length > 0 ? profile.skills.join(", ") : "None"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{profile.latitude != null ? `${profile.latitude}, ${profile.longitude}` : "Not set"}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
