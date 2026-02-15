import { useEffect, useRef, useMemo, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import MapPopup from "./MapPopup";

interface MapMarkerProps {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "visited" | "planned";
  imageUrl?: string | null;
  compressedUrl?: string | null;
  description?: string | null;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  autoOpen?: boolean;
}

const flagSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(34,57%,70%)" stroke="hsl(34,57%,70%)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:1.8rem;height:1.8rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;
const planeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(219,79%,66%)" stroke="hsl(219,79%,66%)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="width:1.8rem;height:1.8rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;

const createDivIcon = (type: "visited" | "planned") =>
  L.divIcon({
    html: `<div class="custom-div-icon">${type === "visited" ? flagSvg : planeSvg}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const MapMarker = ({
  id, name, lat, lng, type, imageUrl, compressedUrl, canDelete, onDelete, autoOpen,
}: MapMarkerProps) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const icon = useMemo(() => createDivIcon(type), [type]);

  useEffect(() => {
    if (autoOpen && markerRef.current) {
      setTimeout(() => {
        markerRef.current?.openPopup();
        map.flyTo([lat, lng], map.getZoom(), { duration: 0.6 });
      }, 500);
    }
  }, [autoOpen, lat, lng, map]);

  // Use compressed (480px) for popup, fallback to imageUrl
  const popupImageUrl = compressedUrl || imageUrl;

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        popupopen: () => {
          setPopupOpen(true);
          map.flyTo([lat, lng], map.getZoom(), { duration: 0.6 });
        },
        popupclose: () => setPopupOpen(false),
      }}
    >
      <Popup>
        <MapPopup
          name={name}
          lat={lat}
          lng={lng}
          imageUrl={popupOpen ? popupImageUrl : undefined}
          type={type}
          canDelete={canDelete}
          onDelete={() => onDelete?.(id)}
        />
      </Popup>
    </Marker>
  );
};

export default MapMarker;
