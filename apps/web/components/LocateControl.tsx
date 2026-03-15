"use client";

import { useCallback } from "react";
import { useMap } from "react-leaflet";

interface LocateControlProps {
	onLocate?: (lat: number, lng: number) => void;
}

export default function LocateControl({ onLocate }: LocateControlProps) {
	const map = useMap();

	const handleLocate = useCallback(() => {
		map.locate({ setView: true, maxZoom: 14 });
		if (onLocate) {
			map.once("locationfound", (e) => {
				onLocate(e.latlng.lat, e.latlng.lng);
			});
		}
	}, [map, onLocate]);

	return (
		<div
			className="leaflet-top leaflet-right"
			style={{ pointerEvents: "auto" }}
		>
			<button
				onClick={handleLocate}
				className="leaflet-control bg-white rounded-md shadow-md m-3 w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100"
				title="Go to my location"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="3" />
					<path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
				</svg>
			</button>
		</div>
	);
}
