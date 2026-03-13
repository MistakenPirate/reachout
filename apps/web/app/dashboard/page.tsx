"use client";

import dynamic from "next/dynamic";
import { useMapData } from "../../lib/queries/map";

const DisasterMap = dynamic(() => import("../../components/DisasterMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Loading map...
    </div>
  ),
});

export default function DashboardPage() {
  const { data, isLoading } = useMapData();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        style={{
          padding: "1rem",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Disaster Response Dashboard</h1>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
          <span>Zones: {data.zones.length}</span>
          <span>Requests: {data.helpRequests.length}</span>
          <span>Volunteers: {data.volunteers.length}</span>
          <span>Resources: {data.resources.length}</span>
        </div>
      </header>
      <main style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Loading...
          </div>
        ) : (
          <DisasterMap data={data} />
        )}
      </main>
    </div>
  );
}
