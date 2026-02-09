import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Heart } from "lucide-react";
import { toast } from "sonner";
import PhotoLightbox from "./PhotoLightbox";

const HEART_GRID = [
  [0,0,1,1,0,1,1,0,0], // Row 1: two humps
  [0,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,0,0,0],
  [0,0,0,0,1,0,0,0,0],
];

// Count filled cells
const FILLED_CELLS = HEART_GRID.flat().filter(Boolean).length;

interface Photo {
  name: string;
  url: string;
}

const compressImage = (file: File, maxWidth: number = 600): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        0.8
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const PhotoWall = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    const { data, error } = await supabase.storage.from("photos").list("", {
      sortBy: { column: "created_at", order: "asc" },
    });
    if (error) { console.error(error); return; }
    if (data) {
      const photoList = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from("photos").getPublicUrl(f.name).data.publicUrl,
        }));
      setPhotos(photoList);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB limit`); continue; }
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage.from("photos").upload(fileName, compressed, { contentType: "image/jpeg" });
        if (error) { toast.error(`Upload failed: ${file.name}`); console.error(error); }
      }
      toast.success("Photos uploaded successfully!");
      fetchPhotos();
    } catch (err) { toast.error("Upload error"); console.error(err); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleDelete = async (name: string) => {
    const { error } = await supabase.storage.from("photos").remove([name]);
    if (error) { toast.error("Delete failed"); }
    else { toast.success("Deleted"); fetchPhotos(); setSelectedPhoto(null); }
  };

  let photoIndex = 0;

  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 px-3 sm:px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gradient-love mb-3 sm:mb-4">
          Our Photo Wall
        </h2>
        <p className="text-sm sm:text-lg text-muted-foreground">Capturing every beautiful moment together</p>
      </div>

      <div className="flex justify-center mb-8 sm:mb-12">
        <label className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300">
          <Upload size={18} className="text-gold" />
          <span className="text-foreground text-sm">{uploading ? "Uploading..." : "Upload Photos"}</span>
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="flex justify-center">
        <div
          className="grid gap-1.5 sm:gap-2 md:gap-2.5"
          style={{ gridTemplateColumns: "repeat(9, 1fr)" }}
        >
          {HEART_GRID.flat().map((filled, i) => {
            if (!filled) {
              return <div key={i} className="w-[40px] h-[40px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px]" />;
            }
            const photo = photos.length > 0 ? photos[photoIndex % photos.length] : null;
            if (photos.length > 0) photoIndex++;
            return (
              <div
                key={i}
                className={`w-[40px] h-[40px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px] rounded-xl overflow-hidden bg-gray-300 transition-transform duration-300 ${photo ? "hover:scale-110 hover:z-10 cursor-pointer" : ""}`}
                onClick={() => photo && setSelectedPhoto(photo.name)}
              >
                {photo && <img src={photo.url} alt="love" className="w-full h-full object-cover" loading="lazy" />}
              </div>
            );
          })}
        </div>
      </div>

      {selectedPhoto && (
        <PhotoLightbox
          photoName={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
};

export default PhotoWall;
