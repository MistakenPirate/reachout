"use client";

import dynamic from "next/dynamic";
import { useMapData } from "@/lib/queries/map";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { MapPinIcon, UsersIcon, HeartHandshakeIcon, PackageIcon } from "lucide-react";

const DisasterMap = dynamic(() => import("@/components/DisasterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Loading map...
    </div>
  ),
});

export default function DashboardPage() {
  const { data, isLoading } = useMapData();

  const stats = [
    { label: "Active Zones", value: data.zones.length, icon: MapPinIcon, color: "bg-primary text-primary-foreground" },
    { label: "Help Requests", value: data.helpRequests.length, icon: HeartHandshakeIcon, color: "bg-secondary text-secondary-foreground" },
    { label: "Volunteers", value: data.volunteers.length, icon: UsersIcon, color: "bg-accent text-accent-foreground" },
    { label: "Resources", value: data.resources.length, icon: PackageIcon, color: "bg-muted text-foreground" },
  ];

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`flex items-center justify-center size-12 shrink-0 ${stat.color}`}>
                <stat.icon className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <main className="flex-1 px-4 pb-4">
        <Card className="h-full overflow-hidden">
          <CardContent className="h-full p-0">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <DisasterMap data={data} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
