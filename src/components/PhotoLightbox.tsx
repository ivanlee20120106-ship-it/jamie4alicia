import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id?: string;
  name: string;
  url: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (idOrName: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canDelete?: boolean;
}

const PhotoLightbox = ({ photos, currentIndex, onClose, onDelete, onPrev, onNext, canDelete = true }: PhotoLightboxProps) => {
  const photo = photos[currentIndex];
  const url = photo.url;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === photos.length - 1;
  const touchStartX = useRef(0);

  // Preload adjacent images
  useEffect(() => {
    const preloadUrls: string[] = [];
    if (currentIndex + 1 < photos.length) preloadUrls.push(photos[currentIndex + 1].url);
    if (currentIndex - 1 >= 0) preloadUrls.push(photos[currentIndex - 1].url);
    preloadUrls.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [currentIndex, photos]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !isFirst) onPrev();
      if (e.key === "ArrowRight" && !isLast) onNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFirst, isLast, onPrev, onNext, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && !isLast) onNext();
      if (diff < 0 && !isFirst) onPrev();
    }
  };

  const deleteKey = photo.id || photo.name;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh] flex items-center gap-2 sm:gap-4" onClick={(e) => e.stopPropagation()}>
        {!isFirst && (
          <button onClick={onPrev} className="shrink-0 p-1.5 sm:p-2 rounded-full bg-card/80 border border-border text-foreground hover:bg-card transition-colors">
            <ChevronLeft size={20} />
          </button>
        )}
        {isFirst && <div className="w-[32px] sm:w-[40px] shrink-0" />}

        <div className="flex flex-col items-center" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <img src={url} alt="photo" className="max-w-full max-h-[75vh] rounded-lg object-contain select-none" draggable={false} />
          <span className="font-display tracking-widest text-muted-foreground text-xs mt-2">
            {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
          <div className="flex gap-3 justify-center mt-3">
            <button onClick={onClose} className="font-body px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:border-love transition-colors">
              Close
            </button>
            {canDelete && (
              <button onClick={() => onDelete(deleteKey)} className="font-body px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity">
                Delete
              </button>
            )}
          </div>
        </div>

        {!isLast && (
          <button onClick={onNext} className="shrink-0 p-1.5 sm:p-2 rounded-full bg-card/80 border border-border text-foreground hover:bg-card transition-colors">
            <ChevronRight size={20} />
          </button>
        )}
        {isLast && <div className="w-[32px] sm:w-[40px] shrink-0" />}
      </div>
    </div>
  );
};

export default PhotoLightbox;
