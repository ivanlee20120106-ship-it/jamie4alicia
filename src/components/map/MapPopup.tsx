import { useState } from "react";
import { Copy, Check, Trash2, Loader2 } from "lucide-react";

interface MapPopupProps {
  name: string;
  lat: number;
  lng: number;
  imageUrl?: string | null;
  address?: string | null;
  addressLoading?: boolean;
  type?: "visited" | "planned" | "clicked" | "searched" | "live";
  canDelete?: boolean;
  onDelete?: () => void;
}

const MapPopup = ({
  name,
  lat,
  lng,
  imageUrl,
  address,
  addressLoading,
  type,
  canDelete,
  onDelete,
}: MapPopupProps) => {
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const coordsText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coordsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDynamic = type === "clicked" || type === "searched" || type === "live";

  return (
    <div className="map-popup-content" style={{ width: "15rem", textAlign: "center" }}>
      {/* Name */}
      <h4 className="font-display text-sm font-semibold mb-1" style={{ color: "hsl(34, 40%, 92%)" }}>
        {name}
      </h4>

      {/* Image with spinner */}
      {imageUrl && (
        <div className="relative w-full h-28 mb-2 rounded overflow-hidden bg-muted/30">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin" style={{ color: "hsl(34, 57%, 70%)" }} />
            </div>
          )}
          <img
            src={imageUrl}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        </div>
      )}

      {/* Reverse geocoded address for dynamic markers */}
      {isDynamic && (
        <div className="text-xs mb-1.5" style={{ color: "hsl(34, 20%, 62%)" }}>
          {addressLoading ? (
            <div className="flex items-center justify-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              <span className="font-body">解析地址中...</span>
            </div>
          ) : (
            <span className="font-body">{address}</span>
          )}
        </div>
      )}

      {/* Coordinates + copy */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <code
          className="text-[11px] tracking-wide"
          style={{ fontFamily: "monospace", color: "hsl(34, 20%, 62%)" }}
        >
          {coordsText}
        </code>
        <button
          onClick={handleCopy}
          className="p-1 rounded transition-colors duration-200"
          style={{
            background: copied ? "hsl(142, 70%, 40%)" : "hsl(219, 79%, 66%)",
            color: "#fff",
          }}
          title="复制坐标"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
      </div>

      {/* Delete */}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          className="mt-2 flex items-center justify-center gap-1 text-xs mx-auto transition-colors"
          style={{ color: "hsl(0, 84%, 60%)" }}
        >
          <Trash2 size={12} />
          <span className="font-body">删除</span>
        </button>
      )}
    </div>
  );
};

export default MapPopup;
