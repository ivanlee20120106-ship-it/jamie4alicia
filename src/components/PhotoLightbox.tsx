import { supabase } from "@/integrations/supabase/client";

interface PhotoLightboxProps {
  photoName: string;
  onClose: () => void;
  onDelete: (name: string) => void;
  canDelete?: boolean;
}

const PhotoLightbox = ({ photoName, onClose, onDelete, canDelete = true }: PhotoLightboxProps) => {
  const url = supabase.storage.from("photos").getPublicUrl(photoName).data.publicUrl;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt="photo" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:border-love transition-colors"
          >
            Close
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(photoName)}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoLightbox;
