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
  visitDate?: string | null;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  autoOpen?: boolean;
}

const heartVisitedSvg = `<div class="custom-div-icon" style="font-size:1.75rem;filter:drop-shadow(0 2px 6px rgba(200,50,80,0.5));line-height:1;text-align:center;">❤️</div>`;
const heartPlannedSvg = `<div class="custom-div-icon marker-pulse" style="font-size:1.75rem;filter:drop-shadow(0 2px 6px rgba(255,100,200,0.5));line-height:1;text-align:center;">💗</div>`;

const createDivIcon = (type: "visited" | "planned") =>
  L.divIcon({
    html: type === "visited" ? heartVisitedSvg : heartPlannedSvg,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

const MapMarker = ({
  id, name, lat, lng, type, imageUrl, compressedUrl, description, visitDate, canDelete, onDelete, autoOpen,
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
          description={description}
          visitDate={visitDate}
          type={type}
          canDelete={canDelete}
          onDelete={() => onDelete?.(id)}
        />
      </Popup>
    </Marker>
  );
};

export default MapMarker;
