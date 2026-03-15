"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapData } from "../lib/queries/map";
import LocateControl from "./LocateControl";
import { DEFAULT_MAP_CENTER, mapIcons, severityColors } from "@/lib/map";

interface DisasterMapProps {
	data: MapData;
}

export default function DisasterMap({ data }: DisasterMapProps) {
	const center = DEFAULT_MAP_CENTER;

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
			<LocateControl />

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
				<Marker
					key={req.id}
					position={[req.latitude, req.longitude]}
					icon={mapIcons.victim}
				>
					<Popup>
						<strong>Help Request</strong>
						<br />
						{req.userName && (
							<>
								From: {req.userName}
								<br />
							</>
						)}
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
						icon={mapIcons.volunteer}
					>
						<Popup>
							<strong>Volunteer</strong>
							<br />
							{vol.userName && (
								<>
									Name: {vol.userName}
									<br />
								</>
							)}
							Skills: {vol.skills.join(", ") || "None listed"}
							<br />
							Status: {vol.status}
						</Popup>
					</Marker>
				))}

			{/* Resources */}
			{data.resources.map((res) => (
				<Marker
					key={res.id}
					position={[res.latitude, res.longitude]}
					icon={mapIcons.resource}
				>
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

			{/* Legend */}
			<div
				className="leaflet-bottom leaflet-left"
				style={{ pointerEvents: "auto" }}
			>
				<div className="leaflet-control bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 m-3 text-xs space-y-1.5">
					<p className="font-semibold text-sm mb-2">Legend</p>
					<div className="flex items-center gap-2">
						<span className="inline-block w-3 h-3 rounded-full bg-red-500" />
						<span>Help Requests</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="inline-block w-3 h-3 rounded-full bg-green-500" />
						<span>Volunteers</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
						<span>Resources</span>
					</div>
					<hr className="my-1.5 border-gray-200" />
					<p className="font-medium">Disaster Zones (circles)</p>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-3 h-3 rounded-full border-2"
							style={{ borderColor: "#dc2626", backgroundColor: "#dc262633" }}
						/>
						<span>Critical</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-3 h-3 rounded-full border-2"
							style={{ borderColor: "#ea580c", backgroundColor: "#ea580c33" }}
						/>
						<span>High</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-3 h-3 rounded-full border-2"
							style={{ borderColor: "#f59e0b", backgroundColor: "#f59e0b33" }}
						/>
						<span>Medium</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-3 h-3 rounded-full border-2"
							style={{ borderColor: "#22c55e", backgroundColor: "#22c55e33" }}
						/>
						<span>Low</span>
					</div>
				</div>
			</div>
		</MapContainer>
	);
}
