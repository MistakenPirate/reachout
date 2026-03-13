"use client";

import { useState } from "react";
import { useMyRequests, useCreateHelpRequest, useResolveHelpRequest } from "../../lib/queries/helpRequests";

const EMERGENCY_TYPES = ["medical", "flood", "fire", "earthquake", "other"] as const;

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  in_progress: "#8b5cf6",
  resolved: "#22c55e",
};

export default function VictimPage() {
  const { data: requests = [], isLoading } = useMyRequests();
  const createMutation = useCreateHelpRequest();
  const resolveMutation = useResolveHelpRequest();

  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [emergencyType, setEmergencyType] = useState<string>("medical");
  const [peopleCount, setPeopleCount] = useState(1);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => setError("Could not detect location. Please enter manually."),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (latitude === "" || longitude === "") {
      setError("Location is required");
      return;
    }

    setError("");
    createMutation.mutate(
      {
        latitude: Number(latitude),
        longitude: Number(longitude),
        emergencyType,
        peopleCount,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          setDescription("");
          setPeopleCount(1);
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Request Help</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Latitude</label>
            <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : "")} required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Longitude</label>
            <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : "")} required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }} />
          </div>
          <button type="button" onClick={detectLocation} style={{ padding: "0.5rem 1rem", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", whiteSpace: "nowrap" }}>
            Detect
          </button>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Emergency Type</label>
          <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }}>
            {EMERGENCY_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Number of People</label>
          <input type="number" min={1} value={peopleCount} onChange={(e) => setPeopleCount(Number(e.target.value))} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 4 }} />
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}

        <button type="submit" disabled={createMutation.isPending} style={{ padding: "0.75rem", background: "#dc2626", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
          {createMutation.isPending ? "Submitting..." : "Submit Help Request"}
        </button>
      </form>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>My Requests</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No requests yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map((req) => (
            <div key={req.id} style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{req.emergencyType}</strong> — {req.peopleCount} people
                {req.description && <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0" }}>{req.description}</p>}
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.25rem 0 0" }}>
                  {new Date(req.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, color: "white", background: statusColors[req.status] || "#6b7280" }}>
                  {req.status}
                </span>
                {req.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => resolveMutation.mutate(req.id)}
                    disabled={resolveMutation.isPending}
                    style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", background: "#22c55e", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
