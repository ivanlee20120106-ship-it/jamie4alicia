import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Heart } from "lucide-react";
import { toast } from "sonner";
import PhotoLightbox from "./PhotoLightbox";

const HEART_GRID = [
  [0,1,1,0,0,1,1,0,0],
  [1,1,1,1,1,1,1,1,0],
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
        <label className="cursor-pointer flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-card border border-border rounded-lg hover:border-love transition-colors">
          <Upload size={18} className="text-love" />
          <span className="text-foreground text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Photos"}</span>
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {photos.length > 0 ? (
        <div className="flex justify-center">
          <div
            className="grid gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5"
            style={{ gridTemplateColumns: "repeat(9, 1fr)" }}
          >
            {HEART_GRID.flat().map((filled, i) => {
              if (!filled) {
                return <div key={i} className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />;
              }
              const photo = photos[photoIndex % photos.length];
              photoIndex++;
              return (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-md overflow-hidden border border-border/30 hover:scale-110 hover:z-10 transition-transform duration-300 cursor-pointer"
                  onClick={() => setSelectedPhoto(photo.name)}
                >
                  <img src={photo.url} alt="love" className="w-full h-full object-cover" loading="lazy" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 sm:py-20">
          <Heart size={48} className="text-muted-foreground animate-pulse-glow" />
          <p className="text-muted-foreground text-base sm:text-lg">No photos yet. Upload your sweet moments!</p>
        </div>
      )}

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
