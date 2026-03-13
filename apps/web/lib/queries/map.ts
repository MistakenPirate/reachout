import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchMapData, createWebSocket } from "../api";
import type { DisasterZone, HelpRequest, Volunteer, Resource, MapData } from "@repo/shared/schemas";

export type { DisasterZone, HelpRequest, Volunteer, Resource, MapData };

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
