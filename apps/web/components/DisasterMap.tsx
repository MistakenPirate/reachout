"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapData } from "../lib/queries/map";

// Fix default marker icons in Next.js
const victimIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const volunteerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const resourceIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const severityColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#f59e0b",
  low: "#22c55e",
};

interface DisasterMapProps {
  data: MapData;
}

export default function DisasterMap({ data }: DisasterMapProps) {
  // Center on India by default
  const center: [number, number] = [20.5937, 78.9629];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Disaster Zones as circles */}
      {data.zones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.latitude, zone.longitude]}
          radius={zone.radiusKm * 1000}
          pathOptions={{
            color: severityColors[zone.severity] || "#f59e0b",
            fillColor: severityColors[zone.severity] || "#f59e0b",
            fillOpacity: 0.2,
          }}
        >
          <Popup>
            <strong>{zone.name}</strong>
            <br />
            Severity: {zone.severity}
            <br />
            Type: {zone.type}
            {zone.description && (
              <>
                <br />
                {zone.description}
              </>
            )}
          </Popup>
        </Circle>
      ))}

      {/* Victim help requests */}
      {data.helpRequests.map((req) => (
        <Marker key={req.id} position={[req.latitude, req.longitude]} icon={victimIcon}>
          <Popup>
            <strong>Help Request</strong>
            <br />
            {req.userName && <>From: {req.userName}<br /></>}
            Type: {req.emergencyType}
            <br />
            People: {req.peopleCount}
            <br />
            Status: {req.status}
            {req.description && (
              <>
                <br />
                {req.description}
              </>
            )}
          </Popup>
        </Marker>
      ))}

      {/* Volunteers */}
      {data.volunteers
        .filter((v) => v.latitude != null && v.longitude != null)
        .map((vol) => (
          <Marker
            key={vol.id}
            position={[vol.latitude!, vol.longitude!]}
            icon={volunteerIcon}
          >
            <Popup>
              <strong>Volunteer</strong>
              <br />
              {vol.userName && <>Name: {vol.userName}<br /></>}
              Skills: {vol.skills.join(", ") || "None listed"}
              <br />
              Status: {vol.status}
            </Popup>
          </Marker>
        ))}

      {/* Resources */}
      {data.resources.map((res) => (
        <Marker key={res.id} position={[res.latitude, res.longitude]} icon={resourceIcon}>
          <Popup>
            <strong>{res.name}</strong>
            <br />
            Type: {res.type}
            <br />
            Quantity: {res.quantity}
            <br />
            Status: {res.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
