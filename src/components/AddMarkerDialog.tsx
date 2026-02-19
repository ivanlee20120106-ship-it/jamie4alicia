import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, Upload, Loader2, CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateSizes } from "@/lib/imageProcessing";
import { travelMarkerSchema } from "@/lib/schemas";

interface AddMarkerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  clickedLatLng: [number, number] | null;
}

const AddMarkerDialog = ({ isOpen, onClose, onAdded, clickedLatLng }: AddMarkerDialogProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"visited" | "planned">("visited");
  const [description, setDescription] = useState("");
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [lat, setLat] = useState(clickedLatLng?.[0]?.toString() ?? "");
  const [lng, setLng] = useState(clickedLatLng?.[1]?.toString() ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const geocodeName = async () => {
    if (!name.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name.trim())}&format=json&limit=1&accept-language=en`
      );
      const data = await res.json();
      if (data.length > 0) {
        setLat(parseFloat(data[0].lat).toFixed(4));
        setLng(parseFloat(data[0].lon).toFixed(4));
        toast.success("Coordinates found!");
      } else {
        toast.error("Location not found");
      }
    } catch {
      toast.error("Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    if (clickedLatLng) {
      setLat(clickedLatLng[0].toFixed(4));
      setLng(clickedLatLng[1].toFixed(4));
    }
  }, [clickedLatLng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const markerData = {
      name: name.trim(),
      lat: parsedLat,
      lng: parsedLng,
      type,
      description: description.trim() || null,
      visit_date: visitDate ? format(visitDate, "yyyy-MM-dd") : null,
    };
    const parsed = travelMarkerSchema.safeParse(markerData);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      await supabase.auth.refreshSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in first"); setSubmitting(false); return; }

      let photoId: string | null = null;
      let imageUrl: string | null = null;

      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); setSubmitting(false); return; }

        const { original, medium, thumbnail, dimensions, isHeif } = await generateSizes(imageFile);
        const uuid = crypto.randomUUID();
        const basePath = `${user.id}/${uuid}`;

        const [okOrig, okMid, okThumb] = await Promise.all([
          supabase.storage.from("marker-images").upload(`${basePath}.jpg`, original, { contentType: "image/jpeg" }).then(r => !r.error),
          supabase.storage.from("marker-images").upload(`${basePath}_mid.jpg`, medium, { contentType: "image/jpeg" }).then(r => !r.error),
          supabase.storage.from("marker-images").upload(`${basePath}_thumb.jpg`, thumbnail, { contentType: "image/jpeg" }).then(r => !r.error),
        ]);

        if (!okOrig) throw new Error("Image upload failed");

        const storagePath = `${basePath}.jpg`;
        imageUrl = supabase.storage.from("marker-images").getPublicUrl(storagePath).data.publicUrl;

        const { data: photoRow, error: photoErr } = await supabase.from("photos").insert({
          filename: `${uuid}.jpg`,
          original_filename: imageFile.name,
          file_size: original.size,
          mime_type: "image/jpeg",
          width: dimensions.width,
          height: dimensions.height,
          storage_path: storagePath,
          thumbnail_path: okThumb ? `${basePath}_thumb.jpg` : null,
          compressed_path: okMid ? `${basePath}_mid.jpg` : null,
          is_heif: isHeif,
          latitude: parsed.data.lat,
          longitude: parsed.data.lng,
          location_name: parsed.data.name,
          user_id: user.id,
        }).select("id").single();

        if (!photoErr && photoRow) photoId = photoRow.id;
      }

      const { error } = await supabase.from("travel_markers" as any).insert({
        name: parsed.data.name,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        type: parsed.data.type,
        description: parsed.data.description || null,
        visit_date: parsed.data.visit_date || null,
        image_url: imageUrl,
        photo_id: photoId,
        user_id: user.id,
      } as any);

      if (error) throw error;
      toast.success("Place added successfully!");
      onAdded();
      onClose();
      setName(""); setDescription(""); setVisitDate(undefined); setImageFile(null); setLat(""); setLng("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add place");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-gold/20 rounded-xl p-6 w-full max-w-md shadow-[0_4px_24px_hsl(var(--gold)/0.08)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-gold" />
            <h3 className="text-lg font-display italic text-foreground">Add a Place</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Place name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocodeName(); } }}
              required
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <button
              type="button"
              onClick={geocodeName}
              disabled={geocoding || !name.trim()}
              className="px-3 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-50"
            >
              {geocoding ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>

          <div className="flex gap-2">
            {(["visited", "planned"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-body transition-all ${
                  type === t
                    ? t === "visited"
                      ? "bg-gold/20 text-gold border border-gold/40"
                      : "bg-primary/20 text-primary border border-primary/40"
                    : "bg-muted/30 text-muted-foreground border border-border"
                }`}
              >
                {t === "visited" ? "🚩 Visited" : "✈️ Planned"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="any" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
            <input type="number" step="any" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <p className="text-[10px] text-muted-foreground font-body -mt-1">💡 You can also tap on the map to pick a location</p>

          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none" />

          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-left flex items-center gap-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50">
                <CalendarIcon size={16} className="text-muted-foreground" />
                <span className={visitDate ? "text-foreground" : "text-muted-foreground"}>
                  {visitDate ? format(visitDate, "dd/MM/yyyy") : "Select a date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
              <Calendar mode="single" selected={visitDate} onSelect={setVisitDate} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border cursor-pointer hover:border-gold/40 transition-colors">
            <Upload size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-body">
              {imageFile ? imageFile.name : "Upload a photo (max 10MB)"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </label>

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-gold to-love text-background font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add Place"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddMarkerDialog;
