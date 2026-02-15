import { useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [visitDate, setVisitDate] = useState("");
  const [lat, setLat] = useState(clickedLatLng?.[0]?.toString() ?? "");
  const [lng, setLng] = useState(clickedLatLng?.[1]?.toString() ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync lat/lng when clickedLatLng changes
  if (clickedLatLng) {
    if (lat !== clickedLatLng[0].toFixed(4)) setLat(clickedLatLng[0].toFixed(4));
    if (lng !== clickedLatLng[1].toFixed(4)) setLng(clickedLatLng[1].toFixed(4));
  }

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 1200;
        let w = img.width, h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.85);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lat || !lng) {
      toast.error("Please enter a place name and coordinates");
      return;
    }

    setSubmitting(true);
    try {
      // Refresh session
      await supabase.auth.refreshSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in first"); setSubmitting(false); return; }

      let imageUrl: string | null = null;

      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) {
          toast.error("Image must be under 10MB");
          setSubmitting(false);
          return;
        }
        const compressed = await compressImage(imageFile);
        const path = `${user.id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from("marker-images")
          .upload(path, compressed, { contentType: "image/jpeg" });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("marker-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("travel_markers" as any).insert({
        name: name.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type,
        description: description.trim() || null,
        visit_date: visitDate || null,
        image_url: imageUrl,
        user_id: user.id,
      } as any);

      if (error) throw error;
      toast.success("Place added successfully!");
      onAdded();
      onClose();
      // Reset
      setName(""); setDescription(""); setVisitDate(""); setImageFile(null);
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
          <input
            type="text"
            placeholder="Place name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />

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
            <input
              type="number"
              step="any"
              placeholder="Latitude *"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude *"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-body -mt-1">💡 You can also tap on the map to pick a location</p>

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
          />

          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border cursor-pointer hover:border-gold/40 transition-colors">
            <Upload size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-body">
              {imageFile ? imageFile.name : "Upload a photo (max 10MB)"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-gold to-love text-background font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add Place"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddMarkerDialog;
