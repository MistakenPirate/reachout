"use client";

import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import LocateControl from "./LocateControl";
import { DEFAULT_MAP_CENTER, mapIcons } from "@/lib/map";

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerModalProps {
  latitude: string;
  longitude: string;
  onSelect: (lat: string, lng: string) => void;
}

export default function LocationPickerModal({ latitude, longitude, onSelect }: LocationPickerModalProps) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState<[number, number] | null>(
    latitude && longitude ? [Number(latitude), Number(longitude)] : null,
  );

  const handleClick = useCallback((lat: number, lng: number) => {
    setPin([lat, lng]);
  }, []);

  function handleConfirm() {
    if (pin) {
      onSelect(pin[0].toFixed(6), pin[1].toFixed(6));
      setOpen(false);
    }
  }

  const center: [number, number] = pin ?? DEFAULT_MAP_CENTER;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        {latitude && longitude
          ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
          : "Pick on Map"}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick a Location</DialogTitle>
        </DialogHeader>
        <div className="h-[400px] w-full rounded-md overflow-hidden">
          <MapContainer center={center} zoom={pin ? 12 : 5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onSelect={handleClick} />
            <LocateControl onLocate={handleClick} />

            {pin && <Marker position={pin} icon={mapIcons.pin} />}
          </MapContainer>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pin ? `${pin[0].toFixed(6)}, ${pin[1].toFixed(6)}` : "Click on the map to select a location"}
          </p>
          <Button onClick={handleConfirm} disabled={!pin}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
