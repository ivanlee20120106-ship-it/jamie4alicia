import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Heart } from "lucide-react";
import { toast } from "sonner";

// Heart shape coordinates - generates positions for photos in a heart shape
const generateHeartPositions = (count: number): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * 2 * Math.PI;
    // Heart parametric equations
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    positions.push({ x, y });
  }
  return positions;
};

// Fill heart interior with a grid approach
const generateHeartGrid = (cols: number, rows: number): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col / (cols - 1)) * 32 - 16;
      const y = (row / (rows - 1)) * 30 - 14;
      // Check if point is inside heart
      const heartX = x / 16;
      const heartY = -y / 16;
      // Simplified heart check
      const val = Math.pow(heartX * heartX + heartY * heartY - 1, 3) - heartX * heartX * heartY * heartY * heartY;
      if (val <= 0.05) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
};

interface Photo {
  name: string;
  url: string;
}

const compressImage = (file: File, maxWidth: number = 400): Promise<Blob> => {
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
    if (error) {
      console.error(error);
      return;
    }
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

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} 超过10MB限制`);
          continue;
        }
        // Compress for display
        const compressed = await compressImage(file, 600);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage.from("photos").upload(fileName, compressed, {
          contentType: "image/jpeg",
        });
        if (error) {
          toast.error(`上传失败: ${file.name}`);
          console.error(error);
        }
      }
      toast.success("照片上传成功！");
      fetchPhotos();
    } catch (err) {
      toast.error("上传出错");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (name: string) => {
    const { error } = await supabase.storage.from("photos").remove([name]);
    if (error) {
      toast.error("删除失败");
    } else {
      toast.success("已删除");
      fetchPhotos();
      setSelectedPhoto(null);
    }
  };

  const heartPositions = generateHeartGrid(12, 14);
  const displayPhotos = photos.length > 0 ? photos : [];

  return (
    <section className="relative z-10 py-20 px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl sm:text-4xl text-gradient-love mb-4">
          我们的照片墙
        </h2>
        <p className="font-body text-lg text-muted-foreground">用照片记录每一个美好瞬间</p>
      </div>

      {/* Upload button */}
      <div className="flex justify-center mb-12">
        <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:border-love transition-colors">
          <Upload size={18} className="text-love" />
          <span className="font-body text-foreground">{uploading ? "上传中..." : "上传照片"}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Heart-shaped photo wall */}
      {displayPhotos.length > 0 ? (
        <div className="flex justify-center">
          <div className="relative" style={{ width: "min(90vw, 600px)", height: "min(90vw, 650px)" }}>
            {heartPositions.slice(0, displayPhotos.length).map((pos, i) => {
              const photo = displayPhotos[i % displayPhotos.length];
              const centerX = 50 + (pos.x / 16) * 45;
              const centerY = 45 + (pos.y / 16) * 42;
              return (
                <div
                  key={i}
                  className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border border-border/30 hover:scale-150 hover:z-30 transition-transform duration-300 cursor-pointer shadow-lg"
                  style={{
                    left: `${centerX}%`,
                    top: `${centerY}%`,
                    transform: "translate(-50%, -50%)",
                    animationDelay: `${i * 0.05}s`,
                  }}
                  onClick={() => setSelectedPhoto(photo.name)}
                >
                  <img
                    src={photo.url}
                    alt="love"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20">
          <Heart size={48} className="text-muted-foreground animate-pulse-glow" />
          <p className="text-muted-foreground font-body text-lg">
            还没有照片，快上传你们的甜蜜瞬间吧！
          </p>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={supabase.storage.from("photos").getPublicUrl(selectedPhoto).data.publicUrl}
              alt="photo"
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-body hover:border-love transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => handleDelete(selectedPhoto)}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-body hover:opacity-80 transition-opacity"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoWall;
