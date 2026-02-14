import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  name: string;
  url: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (name: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canDelete?: boolean;
}

const PhotoLightbox = ({ photos, currentIndex, onClose, onDelete, onPrev, onNext, canDelete = true }: PhotoLightboxProps) => {
  const photo = photos[currentIndex];
  const url = supabase.storage.from("photos").getPublicUrl(photo.name).data.publicUrl;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === photos.length - 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !isFirst) onPrev();
      if (e.key === "ArrowRight" && !isLast) onNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFirst, isLast, onPrev, onNext, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh] flex items-center gap-2 sm:gap-4" onClick={(e) => e.stopPropagation()}>
        {!isFirst && (
          <button
            onClick={onPrev}
            className="shrink-0 p-1.5 sm:p-2 rounded-full bg-card/80 border border-border text-foreground hover:bg-card transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {isFirst && <div className="w-[32px] sm:w-[40px] shrink-0" />}

        <div className="flex flex-col items-center">
          <img src={url} alt="photo" className="max-w-full max-h-[75vh] rounded-lg object-contain" />
          <span className="text-muted-foreground text-xs mt-2">
            {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:border-love transition-colors"
            >
              Close
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(photo.name)}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {!isLast && (
          <button
            onClick={onNext}
            className="shrink-0 p-1.5 sm:p-2 rounded-full bg-card/80 border border-border text-foreground hover:bg-card transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
        {isLast && <div className="w-[32px] sm:w-[40px] shrink-0" />}
      </div>
    </div>
  );
};

export default PhotoLightbox;
