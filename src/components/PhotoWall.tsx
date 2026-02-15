import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import PhotoLightbox from "./PhotoLightbox";
import { generateSizes, validateImageFile } from "@/lib/imageProcessing";

const HEART_GRID = [
  [0,0,1,1,0,1,1,0,0],
  [0,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,0,0,0],
  [0,0,0,0,1,0,0,0,0],
];

export interface PhotoRecord {
  id: string;
  filename: string;
  original_filename: string | null;
  storage_path: string;
  thumbnail_path: string | null;
  compressed_path: string | null;
  file_size: number;
  width: number | null;
  height: number | null;
  is_heif: boolean;
  created_at: string;
}

const MAX_PHOTOS = 36;
const MAX_TOTAL_SIZE = 60 * 1024 * 1024;
const CONCURRENT_LIMIT = 6;

const getPublicUrl = (path: string) =>
  supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;

const uploadWithRetry = async (path: string, blob: Blob, retries = 1): Promise<boolean> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { error } = await supabase.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
    if (!error) return true;
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("403") || msg.includes("401") || msg.includes("not authorized") || msg.includes("permission")) {
      toast.error("登录已过期，请重新登录后再上传");
      return false;
    }
    if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
  }
  return false;
};

/** Get or create the default "Our Memories" wall for the user */
const getOrCreateDefaultWall = async (userId: string): Promise<string | null> => {
  const { data: existing } = await supabase
    .from("photo_walls")
    .select("id")
    .eq("created_by", userId)
    .eq("name", "Our Memories")
    .limit(1)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("photo_walls")
    .insert({ name: "Our Memories", created_by: userId, is_public: true })
    .select("id")
    .single();

  if (error) { console.error("Failed to create default wall:", error); return null; }
  return created?.id ?? null;
};

const PhotoWall = () => {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
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
    const { data, error } = await supabase
      .from("photos")
      .select("id, filename, original_filename, storage_path, thumbnail_path, compressed_path, file_size, width, height, is_heif, created_at")
      .order("created_at", { ascending: true })
      .limit(MAX_PHOTOS);

    if (error) { console.error(error); setPhotos([]); return; }
    setPhotos((data as PhotoRecord[]) ?? []);
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

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
      await supabase.auth.getSession();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { toast.error("请先登录"); setUploading(false); e.target.value = ""; return; }

      const wallId = await getOrCreateDefaultWall(currentUser.id);
      if (!wallId) { toast.error("创建相册失败"); setUploading(false); e.target.value = ""; return; }

      // Validate and prepare
      interface PreparedFile { file: File; original: Blob; medium: Blob; thumbnail: Blob; dimensions: { width: number; height: number }; isHeif: boolean; }
      const validFiles: PreparedFile[] = [];
      for (const file of fileArray) {
        if (file.size > 6 * 1024 * 1024) { toast.error(`${file.name} 超过 6MB 大小限制`); continue; }
        if (!(await validateImageFile(file))) continue;
        try {
          const sizes = await generateSizes(file);
          validFiles.push({ file, ...sizes });
        } catch (err) {
          console.error(`Failed to process ${file.name}:`, err);
          toast.error(`${file.name}: 格式转换失败`);
        }
      }

      if (validFiles.length === 0) { setUploading(false); e.target.value = ""; return; }

      let successCount = 0;
      let failCount = 0;
      const total = validFiles.length;
      setUploadProgress({ current: 0, total });

      for (let i = 0; i < total; i += CONCURRENT_LIMIT) {
        const batch = validFiles.slice(i, i + CONCURRENT_LIMIT);
        const results = await Promise.all(
          batch.map(async ({ file, original, medium, thumbnail, dimensions, isHeif }) => {
            const uuid = crypto.randomUUID();
            const basePath = `${currentUser.id}/${uuid}`;
            const origPath = `${basePath}.jpg`;
            const midPath = `${basePath}_mid.jpg`;
            const thumbPath = `${basePath}_thumb.jpg`;

            // Upload all 3 sizes
            const [okOrig, okMid, okThumb] = await Promise.all([
              uploadWithRetry(origPath, original),
              uploadWithRetry(midPath, medium),
              uploadWithRetry(thumbPath, thumbnail),
            ]);

            if (!okOrig) return false;

            // Insert into photos table
            const { data: photoRow, error: dbErr } = await supabase
              .from("photos")
              .insert({
                filename: `${uuid}.jpg`,
                original_filename: file.name,
                file_size: original.size,
                mime_type: "image/jpeg",
                width: dimensions.width,
                height: dimensions.height,
                storage_path: origPath,
                thumbnail_path: okThumb ? thumbPath : null,
                compressed_path: okMid ? midPath : null,
                is_heif: isHeif,
                user_id: currentUser.id,
              })
              .select("id")
              .single();

            if (dbErr) { console.error("DB insert failed:", dbErr); return false; }

            // Link to wall
            if (photoRow) {
              await supabase.from("photo_wall_items").insert({
                wall_id: wallId,
                photo_id: photoRow.id,
                sort_order: Date.now(),
              });
            }

            return true;
          })
        );
        results.forEach(ok => ok ? successCount++ : failCount++);
        setUploadProgress({ current: Math.min(i + batch.length, total), total });
        if (i + batch.length < total) await new Promise(r => setTimeout(r, 500));
      }

      if (successCount > 0 && failCount === 0) toast.success(`成功上传 ${successCount} 张照片！`);
      else if (successCount > 0) toast.warning(`上传完成：${successCount} 张成功，${failCount} 张失败`);
      else toast.error("所有照片上传失败");

      if (successCount > 0) fetchPhotos();
    } catch (err) { toast.error("上传出错"); console.error(err); }
    finally { setUploading(false); setUploadProgress(null); e.target.value = ""; }
  };

  const handleDelete = async (photoId: string) => {
    // Find the photo record
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    // Delete from DB (cascades photo_wall_items)
    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (error) { toast.error("Delete failed"); return; }

    // Remove files from storage
    const paths = [photo.storage_path, photo.thumbnail_path, photo.compressed_path].filter(Boolean) as string[];
    if (paths.length > 0) {
      await supabase.storage.from("photos").remove(paths);
    }

    toast.success("Deleted");
    setSelectedIndex(null);
    fetchPhotos();
  };

  const flatGrid = HEART_GRID.flat();

  // Build lightbox-friendly photo list
  const lightboxPhotos = photos.map(p => ({
    id: p.id,
    name: p.id,
    url: getPublicUrl(p.storage_path),
    thumbnailUrl: p.thumbnail_path
      ? getPublicUrl(p.thumbnail_path)
      : `${getPublicUrl(p.storage_path)}?width=150&resize=cover&quality=75`,
  }));

  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 px-3 sm:px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="font-display italic tracking-wide text-2xl sm:text-3xl md:text-4xl text-gradient-love mb-3 sm:mb-4">
          Our Photo Wall
        </h2>
        <p className="font-body italic tracking-wide text-sm sm:text-lg text-muted-foreground">Capturing every beautiful moment together</p>
      </div>

      {user && (
        <div className="flex justify-center mb-8 sm:mb-12">
          <label className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300">
            <Upload size={18} className="text-gold" />
            <span className="font-body text-foreground text-sm">
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
          className="photo-grid grid gap-1.5 sm:gap-2 md:gap-2.5"
          style={{ gridTemplateColumns: "repeat(9, var(--cell-size, 34px))" }}
        >
          {flatGrid.map((filled, i) => {
            if (!filled) return <div key={i} className="aspect-square" />;
            const photoIdx = flatGrid.slice(0, i).filter(Boolean).length;
            const photo = photoIdx < lightboxPhotos.length ? lightboxPhotos[photoIdx] : null;
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-xl overflow-hidden ${photo ? "hover:scale-110 hover:z-10 cursor-pointer" : "bg-muted/20"} transition-transform duration-300`}
                onClick={() => photo && setSelectedIndex(photoIdx)}
              >
                {photo && <img src={photo.thumbnailUrl} alt="love" className="w-full h-full object-cover" loading="lazy" decoding="async" />}
              </div>
            );
          })}
        </div>
      </div>

      {selectedIndex !== null && selectedIndex < lightboxPhotos.length && (
        <PhotoLightbox
          photos={lightboxPhotos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onDelete={handleDelete}
          onPrev={() => setSelectedIndex((i) => Math.max(0, (i ?? 1) - 1))}
          onNext={() => setSelectedIndex((i) => Math.min(lightboxPhotos.length - 1, (i ?? 0) + 1))}
          canDelete={!!user}
        />
      )}
    </section>
  );
};

export default PhotoWall;
