import L from "leaflet";

export const DEFAULT_MAP_CENTER: [number, number] = [20.5937, 78.9629];

const SHADOW_URL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";
const MARKER_BASE = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img";

function colorMarker(color: string) {
  return new L.Icon({
    iconUrl: `${MARKER_BASE}/marker-icon-${color}.png`,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

export const mapIcons = {
  victim: colorMarker("red"),
  volunteer: colorMarker("green"),
  resource: colorMarker("blue"),
  pin: colorMarker("red"),
} as const;

export const severityColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#f59e0b",
  low: "#22c55e",
};
