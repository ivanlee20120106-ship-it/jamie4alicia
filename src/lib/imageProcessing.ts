import { toast } from "sonner";

/**
 * Convert HEIC/HEIF to JPEG if needed
 */
export const convertHeicIfNeeded = async (file: File): Promise<File> => {
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

/**
 * Compress/resize image to a given max width
 */
export const compressImage = (file: File | Blob, maxWidth: number = 1200, quality: number = 0.9): Promise<Blob> => {
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
        (blob) => resolve(blob ?? new Blob([file])),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file instanceof File ? file : new Blob([file]));
    };
    img.src = objectUrl;
  });
};

/**
 * Get image dimensions from a File/Blob
 */
export const getImageDimensions = (file: File | Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
};

/**
 * Generate 3 sizes from a source file: original (1200px), medium (480px), thumbnail (150px)
 */
export const generateSizes = async (file: File): Promise<{
  original: Blob;
  medium: Blob;
  thumbnail: Blob;
  dimensions: { width: number; height: number };
  isHeif: boolean;
}> => {
  const converted = await convertHeicIfNeeded(file);
  const isHeif = converted !== file;
  const dimensions = await getImageDimensions(converted);

  const [original, medium, thumbnail] = await Promise.all([
    compressImage(converted, 1200, 0.9),
    compressImage(converted, 480, 0.85),
    compressImage(converted, 150, 0.8),
  ]);

  return { original, medium, thumbnail, dimensions, isHeif };
};

/**
 * Validate image file by MIME type and magic bytes
 */
export const validateImageFile = async (file: File): Promise<boolean> => {
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
    toast.error(`${file.name}: 文件格式不支持。`);
    return false;
  }
  return true;
};
