import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchMapData, createWebSocket } from "../api";

export interface DisasterZone {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radiusKm: number;
  severity: string;
  type: string;
  status: string;
}

export interface HelpRequest {
  id: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
  peopleCount: number;
  description: string | null;
  status: string;
  priorityScore: number | null;
  createdAt: string;
  userName: string | null;
}

export interface Volunteer {
  id: string;
  userId: string;
  skills: string[];
  latitude: number | null;
  longitude: number | null;
  status: string;
  userName: string | null;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  quantity: number;
  latitude: number;
  longitude: number;
  status: string;
}

export interface MapData {
  zones: DisasterZone[];
  helpRequests: HelpRequest[];
  volunteers: Volunteer[];
  resources: Resource[];
}

const WS_EVENTS = [
  "new_request",
  "request_updated",
  "volunteer_assigned",
  "resource_allocated",
  "disaster_zone_created",
  "disaster_zone_updated",
];

export function useMapData() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const query = useQuery<MapData>({
    queryKey: ["map-data"],
    queryFn: fetchMapData,
  });

  useEffect(() => {
    function connect() {
      const ws = createWebSocket();
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (WS_EVENTS.includes(message.type)) {
          queryClient.invalidateQueries({ queryKey: ["map-data"] });
        }
      };

      ws.onclose = () => {
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [queryClient]);

  return {
    data: query.data ?? { zones: [], helpRequests: [], volunteers: [], resources: [] },
    isLoading: query.isLoading,
  };
}
