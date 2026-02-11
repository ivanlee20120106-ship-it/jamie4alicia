import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Music, Upload, SkipForward, SkipBack, X } from "lucide-react";
import { toast } from "sonner";

interface MusicFile {
  name: string;
  url: string;
}

const MusicButton = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracks, setTracks] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const DEFAULT_TRACK: MusicFile = {
    name: "I Love You So (Instrumental)",
    url: "/music/I-Love-You-So-Instrumental.mp3",
  };

  const fetchTracks = useCallback(async () => {
    const { data, error } = await supabase.storage.from("music").list("", {
      sortBy: { column: "created_at", order: "asc" },
    });
    if (error) {
      console.error(error);
      setTracks([DEFAULT_TRACK]);
      return;
    }
    if (data) {
      const musicList = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name.replace(/\.[^.]+$/, "").replace(/^\d+-/, ""),
          url: supabase.storage.from("music").getPublicUrl(f.name).data.publicUrl,
        }));
      setTracks(musicList.length > 0 ? musicList : [DEFAULT_TRACK]);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    audio.src = tracks[currentTrack]?.url || "";

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (tracks.length > 1) {
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
      } else {
        audio.currentTime = 0;
        audio.play();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    // Auto-play: try immediately, fallback to first user interaction
    const tryPlay = () => {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        const startOnInteraction = () => {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          ['click', 'touchstart', 'scroll', 'keydown'].forEach(e =>
            document.removeEventListener(e, startOnInteraction)
          );
        };
        ['click', 'touchstart', 'scroll', 'keydown'].forEach(e =>
          document.addEventListener(e, startOnInteraction, { once: false })
        );
      });
    };

    tryPlay();

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, tracks]);

  const togglePlay = () => {
    if (!audioRef.current || tracks.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => toast.info("Click play to start"));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(e.target.value);
  };

  const validateAudioFile = async (file: File): Promise<boolean> => {
    const allowedMimes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac", "audio/ogg", "audio/flac", "audio/x-m4a"];
    const allowedExts = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedMimes.includes(file.type) && !allowedExts.includes(ext)) {
      toast.error("Only audio files (MP3, WAV, M4A, AAC, OGG, FLAC) are allowed");
      return false;
    }
    // Validate magic bytes
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const isMP3 = bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0;
    const isWAV = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isM4A = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
    const isOGG = bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53;
    const isFLAC = bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43;
    if (!isMP3 && !isWAV && !isM4A && !isOGG && !isFLAC) {
      toast.error("File does not appear to be a valid audio file");
      return false;
    }
    return true;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Music file must be under 20MB");
      return;
    }
    if (!(await validateAudioFile(file))) return;
    setUploading(true);
    const safeExt = file.name.toLowerCase().slice(file.name.lastIndexOf(".")) || ".mp3";
    const fileName = `${crypto.randomUUID()}${safeExt}`;
    const { error } = await supabase.storage.from("music").upload(fileName, file, {
      contentType: file.type || "audio/mpeg",
    });
    if (error) {
      toast.error("Upload failed");
      console.error(error);
    } else {
      toast.success("Music uploaded successfully!");
      fetchTracks();
    }
    setUploading(false);
    e.target.value = "";
  };

  const nextTrack = () => {
    if (tracks.length > 1) {
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    }
  };

  const prevTrack = () => {
    if (tracks.length > 1) {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <audio ref={audioRef} />
      
      {/* Music Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 group"
      >
        <Music size={20} className={`text-gold ${isPlaying ? "animate-pulse" : ""}`} />
        <span className="text-foreground text-sm">
          {isPlaying ? "Now Playing" : "Play Music"}
        </span>
        {isPlaying && (
          <span className="flex gap-0.5">
            <span className="w-1 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-4 bg-gold rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </button>

      {/* Music Player Panel */}
      {isOpen && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 sm:w-80 bg-card/95 backdrop-blur-lg rounded-xl border border-border/50 p-4 shadow-2xl z-50 animate-fade-in">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>

          {/* Track name */}
          <p className="text-sm text-foreground text-center mb-3 pr-6 truncate">
            {tracks.length > 0 ? tracks[currentTrack]?.name : "No music added"}
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground w-8">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 rounded-full appearance-none bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-8">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevTrack}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              disabled={tracks.length <= 1}
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-love/20 flex items-center justify-center hover:bg-love/30 transition-colors"
              disabled={tracks.length === 0}
            >
              {isPlaying ? (
                <Pause size={20} className="text-love" />
              ) : (
                <Play size={20} className="text-love ml-0.5" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              disabled={tracks.length <= 1}
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Upload - only for authenticated users */}
          {user && (
            <div className="mt-4 pt-3 border-t border-border/30">
              <label className="flex items-center justify-center gap-2 cursor-pointer text-muted-foreground hover:text-gold transition-colors text-sm">
                {uploading ? (
                  <>
                    <Music size={16} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload Music</span>
                  </>
                )}
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MusicButton;
