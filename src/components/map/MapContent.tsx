import { useState, useCallback, useMemo } from "react";
import { TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MapMarker from "./MapMarker";
import MapPopup from "./MapPopup";
import MapButtons from "./MapButtons";
import useClickedMarker from "./useClickedMarker";

interface TravelMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string | null;
  visit_date: string | null;
  image_url: string | null;
  user_id: string;
}

interface MapContentProps {
  markers: TravelMarker[];
  canDelete: boolean;
  onDelete: (id: string) => void;
  onAddMarker?: (lat: number, lng: number, name: string, type: "visited" | "planned") => void;
  autoOpenId?: string;
}

// Dynamic marker icons
const clickedIconHtml = `<div class="custom-div-icon custom-div-icon--clicked"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(28,57%,53%)" stroke="hsl(28,57%,53%)" stroke-width="1.5" style="width:1.8rem;height:1.8rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="rgba(15,20,35,0.8)"/></svg></div>`;
const searchedIconHtml = `<div class="custom-div-icon custom-div-icon--searched"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(219,79%,66%)" stroke="hsl(219,79%,66%)" stroke-width="1.5" style="width:1.8rem;height:1.8rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="rgba(15,20,35,0.8)"/></svg></div>`;
const liveIconHtml = `<div class="custom-div-icon custom-div-icon--live"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(0,84%,60%)" stroke="hsl(0,84%,60%)" stroke-width="1.5" style="width:1.8rem;height:1.8rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="rgba(15,20,35,0.8)"/></svg></div>`;

const clickedIcon = L.divIcon({ html: clickedIconHtml, className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
const searchedIcon = L.divIcon({ html: searchedIconHtml, className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
const liveIcon = L.divIcon({ html: liveIconHtml, className: "", iconSize: [30, 30], iconAnchor: [15, 30] });

interface DynamicMarker {
  lat: number;
  lng: number;
  name: string;
  type: "searched" | "live";
  address?: string;
}

const MapContent = ({ markers, canDelete, onDelete, onAddMarker, autoOpenId }: MapContentProps) => {
  const { clicked, clearClicked } = useClickedMarker();
  const [dynamicMarkers, setDynamicMarkers] = useState<DynamicMarker[]>([]);

  const handleSearchResult = useCallback((lat: number, lng: number, name: string) => {
    setDynamicMarkers((prev) => [...prev.filter((m) => m.type !== "searched"), { lat, lng, name, type: "searched", address: name }]);
  }, []);

  const handleLocate = useCallback((_lat: number, _lng: number) => {
    // no-op, locate removed
  }, []);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Database markers */}
      {markers.map((m) => (
        <MapMarker
          key={m.id}
          id={m.id}
          name={m.name}
          lat={m.lat}
          lng={m.lng}
          type={m.type as "visited" | "planned"}
          imageUrl={m.image_url}
          description={m.description}
          canDelete={canDelete}
          onDelete={onDelete}
          autoOpen={m.id === autoOpenId}
        />
      ))}

      {/* Clicked marker */}
      {clicked && (
        <Marker position={[clicked.lat, clicked.lng]} icon={clickedIcon}>
          <Popup eventHandlers={{ remove: clearClicked }}>
            <MapPopup
              name="点击位置"
              lat={clicked.lat}
              lng={clicked.lng}
              type="clicked"
              address={clicked.address}
              addressLoading={clicked.loading}
            />
          </Popup>
        </Marker>
      )}

      {/* Dynamic markers (searched, live) */}
      {dynamicMarkers.map((dm, i) => (
        <Marker
          key={`${dm.type}-${i}`}
          position={[dm.lat, dm.lng]}
          icon={dm.type === "searched" ? searchedIcon : liveIcon}
        >
          <Popup>
            <MapPopup
              name={dm.name}
              lat={dm.lat}
              lng={dm.lng}
              type={dm.type}
              address={dm.address}
            />
          </Popup>
        </Marker>
      ))}

      <MapButtons onSearchResult={handleSearchResult} onAddMarker={onAddMarker} />
    </>
  );
};

export default MapContent;
