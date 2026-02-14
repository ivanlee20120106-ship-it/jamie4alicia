import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Heart } from "lucide-react";
import { toast } from "sonner";
import PhotoLightbox from "./PhotoLightbox";

const HEART_GRID = [
  [0,0,1,1,0,1,1,0,0],
  [0,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,0,0,0],
  [0,0,0,0,1,0,0,0,0],
];

const FILLED_CELLS = HEART_GRID.flat().filter(Boolean).length;

interface Photo {
  name: string;
  url: string;
}

const MAX_PHOTOS = 36;
const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const MAX_CONCURRENCY = 6;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const compressImage = (file: File, maxWidth: number = 1200): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        0.9
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const validateImageFile = async (file: File): Promise<boolean> => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/heic", "image/heif"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".heic", ".heif"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowedMimes.includes(file.type) && !allowedExts.includes(ext)) {
    toast.error(`${file.name}: Only image files (JPG, PNG, GIF, WebP) are allowed`);
    return false;
  }
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
  const isWEBP = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57;
  const isBMP = bytes[0] === 0x42 && bytes[1] === 0x4D;
  const isFTYP = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  if (!isJPEG && !isPNG && !isGIF && !isWEBP && !isBMP && !isFTYP) {
    toast.error(`${file.name}: 文件格式不支持。iOS 用户请在「设置 > 相机 > 格式」中选择「兼容性最佳」以使用 JPG 格式拍照。`);
    return false;
  }
  return true;
};

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Upload a single file with retry logic */
const uploadSinglePhoto = async (
  file: File,
  onProgress: () => void
): Promise<boolean> => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`${file.name} 超过 6MB 大小限制`);
    onProgress();
    return false;
  }
  if (!(await validateImageFile(file))) {
    onProgress();
    return false;
  }

  let compressed: Blob;
  try {
    compressed = await compressImage(file);
  } catch {
    toast.error(`${file.name} 压缩失败`);
    onProgress();
    return false;
  }

  const fileName = `${crypto.randomUUID()}.jpg`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { error } = await supabase.storage
      .from("photos")
      .upload(fileName, compressed, { contentType: "image/jpeg" });
    if (!error) {
      onProgress();
      return true;
    }
    console.error(`Upload attempt ${attempt + 1} failed for ${file.name}:`, error);
    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY * (attempt + 1));
    }
  }

  toast.error(`上传失败: ${file.name}`);
  onProgress();
  return false;
};

/** Run tasks with concurrency limit */
const runWithConcurrency = async <T,>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> => {
  const results: T[] = [];
  let index = 0;

  const runNext = async (): Promise<void> => {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => runNext()
  );
  await Promise.all(workers);
  return results;
};

const PhotoWall = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const fetchPhotos = useCallback(async () => {
    const { data, error } = await supabase.storage.from("photos").list("", {
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) { console.error(error); return; }
    if (data) {
      const photoList = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .slice(0, MAX_PHOTOS)
        .reverse()
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
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { toast.error(`照片墙已满，最多 ${MAX_PHOTOS} 张照片`); e.target.value = ""; return; }
    if (files.length > remaining) { toast.error(`最多还能上传 ${remaining} 张照片`); e.target.value = ""; return; }

    const fileList = Array.from(files);
    setUploading(true);
    setUploadProgress({ done: 0, total: fileList.length });

    let completedCount = 0;
    const onProgress = () => {
      completedCount++;
      setUploadProgress({ done: completedCount, total: fileList.length });
    };

    try {
      const tasks = fileList.map((file) => () => uploadSinglePhoto(file, onProgress));
      const results = await runWithConcurrency(tasks, MAX_CONCURRENCY);
      const successCount = results.filter(Boolean).length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        toast.success(`成功上传 ${successCount} 张照片！`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`上传完成：${successCount} 张成功，${failCount} 张失败`);
      } else if (successCount === 0 && failCount > 0) {
        toast.error("所有照片上传失败");
      }
      if (successCount > 0) fetchPhotos();
    } catch (err) {
      toast.error("上传出错");
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
      e.target.value = "";
    }
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

      {user && (
        <div className="flex justify-center mb-8 sm:mb-12">
          <label className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300">
            <Upload size={18} className="text-gold" />
            <span className="text-foreground text-sm">
              {uploading
                ? `正在上传 ${uploadProgress.done}/${uploadProgress.total}...`
                : "Upload Photos"}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      )}

      <div className="flex justify-center">
        <div
          className="grid gap-1.5 sm:gap-2 md:gap-2.5"
          style={{ gridTemplateColumns: "repeat(9, 1fr)" }}
        >
          {HEART_GRID.flat().map((filled, i) => {
            if (!filled) {
              return <div key={i} className="w-[34px] h-[34px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px]" />;
            }
            const photo = photoIndex < photos.length ? photos[photoIndex] : null;
            photoIndex++;
            return (
              <div
                key={i}
                className={`w-[34px] h-[34px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px] rounded-xl overflow-hidden bg-muted/40 transition-transform duration-300 ${photo ? "hover:scale-110 hover:z-10 cursor-pointer" : ""}`}
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
          canDelete={!!user}
        />
      )}
    </section>
  );
};

export default PhotoWall;
