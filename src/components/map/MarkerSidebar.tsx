import { useState } from "react";
import { useMap } from "react-leaflet";
import { ChevronLeft, ChevronRight, Flag, Plane, MapPin } from "lucide-react";

interface TravelMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string | null;
}

interface MarkerSidebarProps {
  markers: TravelMarker[];
}

const MarkerSidebar = ({ markers }: MarkerSidebarProps) => {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "visited" | "planned">("all");

  const filtered = filter === "all" ? markers : markers.filter((m) => m.type === filter);

  const grouped = {
    visited: filtered.filter((m) => m.type === "visited"),
    planned: filtered.filter((m) => m.type === "planned"),
  };

  const handleClick = (lat: number, lng: number) => {
    map.flyTo([lat, lng], 12, { duration: 1.2 });
  };

  const iconForType = (type: string) =>
    type === "visited" ? <Flag size={14} className="text-[#003380] shrink-0" /> : <Plane size={14} className="text-[#ff249c] shrink-0" />;

  return (
    <div className={`absolute left-0 top-0 bottom-0 z-[1000] flex transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-[220px]"}`}>
      {/* Panel */}
      <div className="w-[220px] h-full bg-background/95 backdrop-blur-md border-r border-border/40 overflow-y-auto py-3 px-2">
        <h3 className="font-display text-sm text-foreground mb-2 px-1">Places ({markers.length})</h3>

        {/* Filter chips */}
        <div className="flex gap-1 mb-3 px-1 flex-wrap">
          {(["all", "visited", "planned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-full text-xs font-body transition-colors ${
                filter === f
                  ? "bg-gold/20 text-gold border border-gold/40"
                  : "bg-muted/30 text-muted-foreground border border-border hover:border-gold/20"
              }`}
            >
              {f === "all" ? "All" : f === "visited" ? "🚩 Visited" : "✈️ Planned"}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {(["visited", "planned"] as const).map((type) => {
          const items = grouped[type];
          if (items.length === 0) return null;
          return (
            <div key={type} className="mb-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-body px-1 mb-1">
                {type === "visited" ? "Visited" : "Planned"} ({items.length})
              </div>
              {items.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleClick(m.lat, m.lng)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-muted/40 transition-colors group"
                >
                  {iconForType(m.type)}
                  <div className="min-w-0">
                    <div className="text-xs text-foreground truncate group-hover:text-gold transition-colors">{m.name}</div>
                    {m.description && (
                      <div className="text-[10px] text-muted-foreground truncate">{m.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8 font-body italic">No places yet</p>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="self-center -ml-px w-6 h-16 rounded-r-lg bg-background/90 backdrop-blur border border-l-0 border-border/40 flex items-center justify-center hover:bg-muted/50 transition-colors"
        title={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <ChevronLeft size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
      </button>
    </div>
  );
};

export default MarkerSidebar;
