import { useCallback } from "react";
import { useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const useMapFlyTo = () => {
  const map = useMap();

  const flyTo = useCallback(
    (latlng: LatLngExpression, zoom?: number, duration = 0.6) => {
      return new Promise<void>((resolve) => {
        map.flyTo(latlng, zoom ?? map.getZoom(), { duration });
        map.once("moveend", () => resolve());
      });
    },
    [map]
  );

  return flyTo;
};

export default useMapFlyTo;
