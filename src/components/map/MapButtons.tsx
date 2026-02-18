import { useState, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import { Search, Loader2, Flag, Plane, LocateFixed, Maximize2 } from "lucide-react";

interface MapButtonsProps {
  onSearchResult?: (lat: number, lng: number, name: string) => void;
  onAddMarker?: (lat: number, lng: number, name: string, type: "visited" | "planned") => void;
}

const MapButtons = ({ onSearchResult, onAddMarker }: MapButtonsProps) => {
  const map = useMap();
  const [activeInput, setActiveInput] = useState<"search" | "visited" | "planned" | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchAndAct = useCallback(async (action: "search" | "visited" | "planned") => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latN = parseFloat(lat);
        const lngN = parseFloat(lon);
        map.flyTo([latN, lngN], 12, { duration: 1.5 });

        if (action === "search") {
          onSearchResult?.(latN, lngN, display_name);
        } else {
          onAddMarker?.(latN, lngN, display_name.split(",")[0].trim(), action);
        }
        setQuery("");
        setActiveInput(null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [query, map, onSearchResult, onAddMarker]);

  const openInput = (type: "search" | "visited" | "planned") => {
    setActiveInput(type);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const placeholders: Record<string, string> = {
    search: "Search place...",
    visited: "Visited city...",
    planned: "Planned city...",
  };

  const handleLocate = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: 1.5 }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, [map]);

  const handleResetView = useCallback(() => {
    map.flyTo([20, 0], 2, { duration: 1.2 });
  }, [map]);

  const btnClass =
    "w-10 h-10 sm:w-[3rem] sm:h-[3rem] rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg";
  const btnStyle = {
    background: "rgb(0, 94, 172)",
    color: "#fff",
    border: "none",
  };

  return (
    <div className="map-buttons absolute right-4 z-[1000] flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        {activeInput === "search" && (
          <form onSubmit={(e) => { e.preventDefault(); searchAndAct("search"); }} className="flex">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setActiveInput(null); }}
              placeholder={placeholders.search}
              className="map-search-input px-3 py-2 rounded-lg text-sm border shadow-md w-[9rem] sm:w-[12rem]"
              style={{ background: "rgba(255,255,255,0.95)", borderColor: "hsl(0,0%,80%)", color: "#333", outline: "none" }}
              autoFocus
            />
          </form>
        )}
        <button className={btnClass} style={btnStyle} onClick={() => activeInput === "search" ? searchAndAct("search") : openInput("search")} title="Search">
          {loading && activeInput === "search" ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </div>

      {/* Add Visited */}
      <div className="flex items-center gap-2">
        {activeInput === "visited" && (
          <form onSubmit={(e) => { e.preventDefault(); searchAndAct("visited"); }} className="flex">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setActiveInput(null); }}
              placeholder={placeholders.visited}
              style={{ background: "rgba(255,255,255,0.95)", borderColor: "hsl(0,0%,80%)", color: "#333", outline: "none" }}
              className="map-search-input px-3 py-2 rounded-lg text-sm border shadow-md w-[9rem] sm:w-[12rem]"
              autoFocus
            />
          </form>
        )}
        <button className={btnClass} style={{ ...btnStyle, background: "#003380" }} onClick={() => activeInput === "visited" ? searchAndAct("visited") : openInput("visited")} title="Add visited">
          {loading && activeInput === "visited" ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />}
        </button>
      </div>

      {/* Add Planned */}
      <div className="flex items-center gap-2">
        {activeInput === "planned" && (
          <form onSubmit={(e) => { e.preventDefault(); searchAndAct("planned"); }} className="flex">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setActiveInput(null); }}
              placeholder={placeholders.planned}
              style={{ background: "rgba(255,255,255,0.95)", borderColor: "hsl(0,0%,80%)", color: "#333", outline: "none" }}
              className="map-search-input px-3 py-2 rounded-lg text-sm border shadow-md w-[9rem] sm:w-[12rem]"
              autoFocus
            />
          </form>
        )}
        <button className={btnClass} style={{ ...btnStyle, background: "#ff249c" }} onClick={() => activeInput === "planned" ? searchAndAct("planned") : openInput("planned")}>
          {loading && activeInput === "planned" ? <Loader2 size={18} className="animate-spin" /> : <Plane size={18} />}
        </button>
      </div>

      {/* Locate */}
      <button className={btnClass} style={btnStyle} onClick={handleLocate} title="My location">
        <LocateFixed size={18} />
      </button>

      {/* Reset View */}
      <button className={btnClass} style={{ ...btnStyle, background: "rgb(0, 70, 130)" }} onClick={handleResetView} title="Reset view">
        <Maximize2 size={18} />
      </button>
    </div>
  );
};

export default MapButtons;
