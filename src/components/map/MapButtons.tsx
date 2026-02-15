import { useState, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import { Search, Navigation, Maximize, Loader2 } from "lucide-react";

interface MapButtonsProps {
  onSearchResult?: (lat: number, lng: number, name: string) => void;
  onLocate?: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [35, 105];
const DEFAULT_ZOOM = 4;

const MapButtons = ({ onSearchResult, onLocate }: MapButtonsProps) => {
  const map = useMap();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=zh`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latN = parseFloat(lat);
        const lngN = parseFloat(lon);
        map.flyTo([latN, lngN], 12, { duration: 1.5 });
        onSearchResult?.(latN, lngN, display_name);
        setSearchQuery("");
        setSearchOpen(false);
      }
    } catch {
      // silent fail
    } finally {
      setSearching(false);
    }
  }, [searchQuery, map, onSearchResult]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        onLocate?.(latitude, longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map, onLocate]);

  const handleReset = useCallback(() => {
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.5 });
  }, [map]);

  const btnClass =
    "w-[3rem] h-[3rem] rounded-lg flex items-center justify-center transition-all duration-200 border";
  const btnStyle = {
    background: "rgba(15, 20, 35, 0.85)",
    borderColor: "hsl(34, 57%, 70%, 0.3)",
    color: "hsl(34, 57%, 70%)",
    backdropFilter: "blur(8px)",
  };

  return (
    <div className="map-buttons absolute bottom-4 right-4 z-[1000] flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        {searchOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex"
          >
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery) setSearchOpen(false);
              }}
              placeholder="搜索地点..."
              className="map-search-input px-3 py-2 rounded-lg text-sm font-body border"
              style={{
                background: "rgba(15, 20, 35, 0.9)",
                borderColor: "hsl(34, 57%, 70%, 0.3)",
                color: "hsl(34, 40%, 92%)",
                width: "12rem",
                outline: "none",
              }}
              autoFocus
            />
          </form>
        )}
        <button
          className={btnClass}
          style={btnStyle}
          onClick={() => {
            if (searchOpen) {
              handleSearch();
            } else {
              setSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
        >
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </div>

      {/* Locate */}
      <button className={btnClass} style={btnStyle} onClick={handleLocate}>
        {locating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
      </button>

      {/* Reset view */}
      <button className={btnClass} style={btnStyle} onClick={handleReset}>
        <Maximize size={18} />
      </button>
    </div>
  );
};

export default MapButtons;
