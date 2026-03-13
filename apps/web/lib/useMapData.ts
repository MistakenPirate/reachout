"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchMapData, createWebSocket } from "./api";

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

export function useMapData() {
  const [data, setData] = useState<MapData>({
    zones: [],
    helpRequests: [],
    volunteers: [],
    resources: [],
  });
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadData = useCallback(async () => {
    try {
      const mapData = await fetchMapData();
      setData(mapData);
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWs = useCallback(() => {
    const ws = createWebSocket();
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Reload all data on any update for simplicity
      if (
        [
          "new_request",
          "request_updated",
          "volunteer_assigned",
          "resource_allocated",
          "disaster_zone_created",
          "disaster_zone_updated",
        ].includes(message.type)
      ) {
        loadData();
      }
    };

    ws.onclose = () => {
      // Reconnect with exponential backoff
      reconnectTimeout.current = setTimeout(() => connectWs(), 3000);
    };

    ws.onerror = () => ws.close();
  }, [loadData]);

  useEffect(() => {
    loadData();
    connectWs();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [loadData, connectWs]);

  return { data, loading };
}
