import { MapPin, Plane, Calendar, Trash2 } from "lucide-react";

interface MarkerPopupProps {
  marker: {
    id: string;
    name: string;
    type: string;
    description?: string | null;
    visit_date?: string | null;
    image_url?: string | null;
  };
  canDelete: boolean;
  onDelete: (id: string) => void;
}

const MarkerPopup = ({ marker, canDelete, onDelete }: MarkerPopupProps) => {
  return (
    <div className="min-w-[200px] max-w-[260px]">
      {marker.image_url && (
        <img
          src={marker.image_url}
          alt={marker.name}
          className="w-full h-32 object-cover rounded-lg mb-2"
        />
      )}
      <div className="flex items-center gap-2 mb-1">
        {marker.type === "visited" ? (
          <MapPin size={14} className="text-gold shrink-0" />
        ) : (
          <Plane size={14} className="text-primary shrink-0" />
        )}
        <h4 className="font-display text-sm font-semibold text-foreground truncate">
          {marker.name}
        </h4>
      </div>
      <span
        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-body mb-1 ${
          marker.type === "visited"
            ? "bg-gold/20 text-gold"
            : "bg-primary/20 text-primary"
        }`}
      >
        {marker.type === "visited" ? "已去过" : "计划中"}
      </span>
      {marker.description && (
        <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-3">
          {marker.description}
        </p>
      )}
      {marker.visit_date && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Calendar size={10} />
          <span className="font-body">{marker.visit_date}</span>
        </div>
      )}
      {canDelete && (
        <button
          onClick={() => onDelete(marker.id)}
          className="mt-2 flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash2 size={12} />
          <span className="font-body">删除</span>
        </button>
      )}
    </div>
  );
};

export default MarkerPopup;
