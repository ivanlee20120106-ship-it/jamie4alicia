import { useState, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import { Search, Loader2, Flag, Plane } from "lucide-react";

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
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=zh`
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
    search: "搜索地点...",
    visited: "输入已去过的城市...",
    planned: "输入计划中的城市...",
  };

  const btnClass =
    "w-[3rem] h-[3rem] rounded-lg flex items-center justify-center transition-all duration-200 border shadow-md";
  const btnStyle = {
    background: "rgba(255, 255, 255, 0.92)",
    borderColor: "hsl(0, 0%, 80%)",
    color: "hsl(0, 0%, 30%)",
    backdropFilter: "blur(8px)",
  };

  return (
    <div className="map-buttons absolute bottom-4 right-4 z-[1000] flex flex-col gap-3">
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
              className="px-3 py-2 rounded-lg text-sm border shadow-md"
              style={{ background: "rgba(255,255,255,0.95)", borderColor: "hsl(0,0%,80%)", color: "#333", width: "12rem", outline: "none" }}
              autoFocus
            />
          </form>
        )}
        <button className={btnClass} style={btnStyle} onClick={() => activeInput === "search" ? searchAndAct("search") : openInput("search")}>
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
              className="px-3 py-2 rounded-lg text-sm border shadow-md"
              style={{ background: "rgba(255,255,255,0.95)", borderColor: "hsl(0,0%,80%)", color: "#333", width: "12rem", outline: "none" }}
              autoFocus
            />
          </form>
        )}
        <button className={btnClass} style={{ ...btnStyle, color: "hsl(34, 57%, 50%)" }} onClick={() => activeInput === "visited" ? searchAndAct("visited") : openInput("visited")}>
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
              className="px-3 py-2 rounded-lg text-sm border shadow-md"
              style={{ background: "rgba(255,255,255,0.95)", borderColor: "hsl(0,0%,80%)", color: "#333", width: "12rem", outline: "none" }}
              autoFocus
            />
          </form>
        )}
        <button className={btnClass} style={{ ...btnStyle, color: "hsl(219, 79%, 56%)" }} onClick={() => activeInput === "planned" ? searchAndAct("planned") : openInput("planned")}>
          {loading && activeInput === "planned" ? <Loader2 size={18} className="animate-spin" /> : <Plane size={18} />}
        </button>
      </div>
    </div>
  );
};

export default MapButtons;
