"use client";

import dynamic from "next/dynamic";
import { useMapData } from "@/lib/queries/map";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

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
    { label: "Active Zones", value: data.zones.length },
    { label: "Help Requests", value: data.helpRequests.length },
    { label: "Volunteers", value: data.volunteers.length },
    { label: "Resources", value: data.resources.length },
  ];

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex gap-4 p-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex-1">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
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
