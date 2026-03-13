"use client";

import { useState, useEffect } from "react";
import { useVolunteerProfile, useUpdateVolunteerProfile } from "../../lib/queries/volunteer";

const ALL_SKILLS = ["medical", "search_rescue", "transport", "food", "shelter"] as const;

export default function VolunteerPage() {
  const { data: profile, isLoading } = useVolunteerProfile();
  const updateMutation = useUpdateVolunteerProfile();

  const [skills, setSkills] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setSkills(profile.skills || []);
      if (profile.latitude != null) setLatitude(profile.latitude);
      if (profile.longitude != null) setLongitude(profile.longitude);
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
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
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
        latitude: latitude !== "" ? Number(latitude) : undefined,
        longitude: longitude !== "" ? Number(longitude) : undefined,
        isAvailable,
      },
      {
        onSuccess: () => setSuccess("Profile updated successfully"),
        onError: (err) => setError(err.message),
      },
    );
  }

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Volunteer Profile</h1>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: 8 }}>
        {/* Availability toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>Availability</span>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: 20,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              color: "white",
              background: isAvailable ? "#22c55e" : "#6b7280",
            }}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </button>
        </div>

        {/* Skills multi-select */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 8, fontWeight: 500 }}>Skills</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {ALL_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: 16,
                  border: "1px solid",
                  borderColor: skills.includes(skill) ? "#3b82f6" : "#d1d5db",
                  background: skills.includes(skill) ? "#3b82f6" : "white",
                  color: skills.includes(skill) ? "white" : "#374151",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {skill.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Latitude</label>
            <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : "")} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Longitude</label>
            <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : "")} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }} />
          </div>
          <button type="button" onClick={detectLocation} style={{ padding: "0.5rem 1rem", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", whiteSpace: "nowrap" }}>
            Detect
          </button>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}
        {success && <p style={{ color: "#22c55e", fontSize: "0.875rem" }}>{success}</p>}

        <button type="submit" disabled={updateMutation.isPending} style={{ padding: "0.75rem", background: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
          {updateMutation.isPending ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {profile && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f9fafb", borderRadius: 8, fontSize: "0.875rem" }}>
          <p><strong>Status:</strong> {profile.status}</p>
          <p><strong>Skills:</strong> {profile.skills.length > 0 ? profile.skills.join(", ") : "None"}</p>
          <p><strong>Location:</strong> {profile.latitude != null ? `${profile.latitude}, ${profile.longitude}` : "Not set"}</p>
        </div>
      )}
    </div>
  );
}
