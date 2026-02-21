import { Polyline, Tooltip } from "react-leaflet";
import type { TravelRoute } from "@/hooks/useRoutes";

interface MapRoutesProps {
  routes: TravelRoute[];
}

const MapRoutes = ({ routes }: MapRoutesProps) => {
  return (
    <>
      {routes.map((route) => {
        const positions = route.path.map((p) => [p.lat, p.lng] as [number, number]);
        if (positions.length < 2) return null;
        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: route.color,
              weight: 3,
              opacity: 0.8,
              dashArray: "8 4",
            }}
          >
            <Tooltip sticky>{route.name}</Tooltip>
          </Polyline>
        );
      })}
    </>
  );
};

export default MapRoutes;
