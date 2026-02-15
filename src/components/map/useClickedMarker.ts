import { useState, useCallback } from "react";
import { useMapEvents } from "react-leaflet";

export interface ClickedLocation {
  lat: number;
  lng: number;
  address: string | null;
  loading: boolean;
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

const useClickedMarker = () => {
  const [clicked, setClicked] = useState<ClickedLocation | null>(null);

  const clearClicked = useCallback(() => setClicked(null), []);

  useMapEvents({
    click: async (e) => {
      const target = e.originalEvent.target as HTMLElement;
      // Ignore clicks on controls, buttons, popups
      if (
        target.closest(".leaflet-control") ||
        target.closest(".map-buttons") ||
        target.closest(".leaflet-popup") ||
        target.closest(".leaflet-marker-icon")
      ) {
        return;
      }

      const { lat, lng } = e.latlng;
      setClicked({ lat, lng, address: null, loading: true });

      const address = await reverseGeocode(lat, lng);
      setClicked({ lat, lng, address, loading: false });
    },
  });

  return { clicked, clearClicked };
};

export default useClickedMarker;
