import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import MapContent from "./map/MapContent";
import AddMarkerDialog from "./AddMarkerDialog";

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

type FilterType = "all" | "visited" | "planned";

const TravelMap = () => {
  const { user } = useAuth();
  const [markers, setMarkers] = useState<TravelMarker[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState<[number, number] | null>(null);

  const fetchMarkers = useCallback(async () => {
    const { data, error } = await supabase.from("travel_markers" as any).select("*").order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    setMarkers((data as any as TravelMarker[]) ?? []);
  }, []);

  useEffect(() => { fetchMarkers(); }, [fetchMarkers]);

  const filteredMarkers = useMemo(
    () => filter === "all" ? markers : markers.filter((m) => m.type === filter),
    [markers, filter]
  );

  // Pick a random marker to auto-open on load
  const autoOpenId = useMemo(() => {
    if (markers.length === 0) return undefined;
    return markers[Math.floor(Math.random() * markers.length)].id;
  }, [markers]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("travel_markers" as any).delete().eq("id", id);
    if (error) { toast.error("删除失败"); return; }
    toast.success("已删除");
    fetchMarkers();
  }, [fetchMarkers]);

  const handleAddFromMap = useCallback(async (lat: number, lng: number, name: string, type: "visited" | "planned") => {
    if (!user) { toast.error("请先登录"); return; }
    const { error } = await supabase.from("travel_markers" as any).insert({ lat, lng, name, type, user_id: user.id });
    if (error) { toast.error("添加失败"); return; }
    toast.success(`已添加: ${name}`);
    fetchMarkers();
  }, [user, fetchMarkers]);

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "visited", label: "🚩 已去过" },
    { key: "planned", label: "✈️ 计划中" },
  ];

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 pt-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display italic text-center text-gradient-gold mb-6 tracking-wide">
          Our Journey Map
        </h2>

        {/* Filter bar */}
        <div className="flex justify-center gap-2 mb-4">
          {filterButtons.map((b) => (
            <button
              key={b.key}
              onClick={() => setFilter(b.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-body transition-all duration-300 ${
                filter === b.key
                  ? "bg-gold/20 text-gold border border-gold/40 shadow-[0_0_12px_hsl(var(--gold)/0.15)]"
                  : "bg-muted/30 text-muted-foreground border border-border hover:border-gold/20"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-gold/20 shadow-[0_4px_24px_hsl(var(--gold)/0.08)] backdrop-blur-md relative">
          <MapContainer
            center={[20, 105]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            attributionControl={false}
            className="h-[450px] sm:h-[650px] w-full"
            style={{ background: "#f2f2f2" }}
          >
            <MapContent
              markers={filteredMarkers}
              canDelete={!!user}
              onDelete={handleDelete}
              onAddMarker={handleAddFromMap}
              autoOpenId={autoOpenId}
            />
          </MapContainer>
        </div>

        {/* Add place button */}
        {user && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => { setClickedLatLng(null); setDialogOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-card/40 backdrop-blur-sm hover:border-gold/60 hover:shadow-[0_0_16px_hsl(var(--gold)/0.25)] transition-all duration-300"
            >
              <Plus size={16} className="text-gold" />
              <span className="text-sm text-gold font-body italic">Add Place</span>
            </button>
          </div>
        )}
      </div>

      <AddMarkerDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdded={fetchMarkers}
        clickedLatLng={clickedLatLng}
      />
    </section>
  );
};

export default TravelMap;
