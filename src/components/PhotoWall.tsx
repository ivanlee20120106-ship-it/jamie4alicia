import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
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

interface Photo {
  name: string;
  url: string;
}

const MAX_PHOTOS = 36;
const MAX_TOTAL_SIZE = 60 * 1024 * 1024; // 60MB
const CONCURRENT_LIMIT = 6;

const convertHeicIfNeeded = async (file: File): Promise<File> => {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isFTYP = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  const ext = file.name.toLowerCase();
  const isHeic = isFTYP || ext.endsWith('.heic') || ext.endsWith('.heif');

  if (!isHeic) return file;

  toast.info(`正在转换 ${file.name} 格式...`);
  const heic2any = (await import('heic2any')).default;
  const jpegBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
  return new File([blob], file.name.replace(/\.heic|\.heif/i, '.jpg'), { type: 'image/jpeg' });
};

const compressImage = (file: File, maxWidth: number = 1200): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.warn(`Cannot render ${file.name} in browser, using original file`);
      resolve(file);
    };
    img.src = objectUrl;
  });
};

const uploadWithRetry = async (fileName: string, blob: Blob, retries = 1): Promise<boolean> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { error } = await supabase.storage.from("photos").upload(fileName, blob, { contentType: "image/jpeg" });
    if (!error) return true;
    console.error(`Upload attempt ${attempt + 1} failed for ${fileName}:`, error.message, error);
    if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
  }
  return false;
};

const PhotoWall = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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

  const validateImageFile = async (file: File): Promise<boolean> => {
    // Bug 5 fix: add HEIC/HEIF support in MIME and extension checks
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
    // HEIC/HEIF: ftyp box at offset 4
    const isFTYP = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
    if (!isJPEG && !isPNG && !isGIF && !isWEBP && !isBMP && !isFTYP) {
      toast.error(`${file.name}: 文件格式不支持。iOS 用户请在「设置 > 相机 > 格式」中选择「兼容性最佳」以使用 JPG 格式拍照。`);
      return false;
    }
    return true;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { toast.error(`照片墙已满，最多 ${MAX_PHOTOS} 张照片`); e.target.value = ""; return; }
    if (files.length > remaining) { toast.error(`最多还能上传 ${remaining} 张照片`); e.target.value = ""; return; }

    const fileArray = Array.from(files);
    const totalSize = fileArray.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) { toast.error("本次上传总大小超过 60MB 限制"); e.target.value = ""; return; }

    setUploading(true);
    try {
      // Refresh token before starting long upload to prevent expiration
      await supabase.auth.getSession();
      // Validate and compress
      const validFiles: { file: File; compressed: Blob }[] = [];
      for (const file of fileArray) {
        if (file.size > 6 * 1024 * 1024) { toast.error(`${file.name} 超过 6MB 大小限制`); continue; }
        if (!(await validateImageFile(file))) continue;
        try {
          const converted = await convertHeicIfNeeded(file);
          const compressed = await compressImage(converted);
          validFiles.push({ file, compressed });
        } catch (err) {
          console.error(`Failed to process ${file.name}:`, err);
          toast.error(`${file.name}: 格式转换失败，请尝试其他格式`);
          continue;
        }
      }

      if (validFiles.length === 0) { setUploading(false); e.target.value = ""; return; }

      // Batch concurrent upload
      let successCount = 0;
      let failCount = 0;
      const total = validFiles.length;
      setUploadProgress({ current: 0, total });

      for (let i = 0; i < total; i += CONCURRENT_LIMIT) {
        const batch = validFiles.slice(i, i + CONCURRENT_LIMIT);
        const results = await Promise.all(
          batch.map(async ({ file, compressed }) => {
            const fileName = `${crypto.randomUUID()}.jpg`;
            const ok = await uploadWithRetry(fileName, compressed);
            if (!ok) toast.error(`上传失败: ${file.name}`);
            return ok;
          })
        );
        results.forEach(ok => ok ? successCount++ : failCount++);
        setUploadProgress({ current: Math.min(i + batch.length, total), total });
        // Add delay between batches to avoid rate limiting
        if (i + batch.length < total) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (successCount > 0 && failCount === 0) toast.success(`成功上传 ${successCount} 张照片！`);
      else if (successCount > 0) toast.warning(`上传完成：${successCount} 张成功，${failCount} 张失败`);
      else toast.error("所有照片上传失败");

      if (successCount > 0) fetchPhotos();
    } catch (err) { toast.error("上传出错"); console.error(err); }
    finally { setUploading(false); setUploadProgress(null); e.target.value = ""; }
  };

  const handleDelete = async (name: string) => {
    const { error } = await supabase.storage.from("photos").remove([name]);
    if (error) { toast.error("Delete failed"); }
    else { toast.success("Deleted"); fetchPhotos(); setSelectedIndex(null); }
  };

  const flatGrid = HEART_GRID.flat();

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
                ? uploadProgress
                  ? `正在上传 ${uploadProgress.current}/${uploadProgress.total}...`
                  : "准备中..."
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
          {flatGrid.map((filled, i) => {
            if (!filled) {
              return <div key={i} className="w-[34px] h-[34px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px]" />;
            }
            const photoIdx = flatGrid.slice(0, i).filter(Boolean).length;
            const photo = photoIdx < photos.length ? photos[photoIdx] : null;
            return (
              <div
                key={i}
                className={`relative w-[34px] h-[34px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px] rounded-xl overflow-hidden bg-muted/40 transition-transform duration-300 ${photo ? "hover:scale-110 hover:z-10 cursor-pointer" : ""}`}
                onClick={() => photo && setSelectedIndex(photoIdx)}
              >
                {photo && <img src={photo.url} alt="love" className="w-full h-full object-cover" loading="lazy" />}
              </div>
            );
          })}
        </div>
      </div>

      {selectedIndex !== null && selectedIndex < photos.length && (
        <PhotoLightbox
          photos={photos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onDelete={handleDelete}
          onPrev={() => setSelectedIndex((i) => Math.max(0, (i ?? 1) - 1))}
          onNext={() => setSelectedIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
          canDelete={!!user}
        />
      )}
    </section>
  );
};

export default PhotoWall;
