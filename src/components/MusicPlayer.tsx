import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Volume2, VolumeX, Upload, Music } from "lucide-react";
import { toast } from "sonner";

interface MusicFile {
  name: string;
  url: string;
}

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracks, setTracks] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [uploading, setUploading] = useState(false);

  const fetchTracks = useCallback(async () => {
    const { data, error } = await supabase.storage.from("music").list("", {
      sortBy: { column: "created_at", order: "asc" },
    });
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const musicList = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name.replace(/\.[^.]+$/, "").replace(/^\d+-/, ""),
          url: supabase.storage.from("music").getPublicUrl(f.name).data.publicUrl,
        }));
      setTracks(musicList);
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

    // Autoplay attempt
    if (isPlaying) {
      audio.play().catch(() => {});
    }

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
      audioRef.current.play().catch(() => toast.info("请点击播放按钮开始播放"));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(e.target.value);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("音乐文件不能超过20MB");
      return;
    }
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("music").upload(fileName, file, {
      contentType: file.type,
    });
    if (error) {
      toast.error("上传失败");
      console.error(error);
    } else {
      toast.success("音乐上传成功！");
      fetchTracks();
    }
    setUploading(false);
    e.target.value = "";
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-t border-border">
      <audio ref={audioRef} />
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-love/20 flex items-center justify-center hover:bg-love/30 transition-colors flex-shrink-0"
          disabled={tracks.length === 0}
        >
          {isPlaying ? (
            <Pause size={18} className="text-love" />
          ) : (
            <Play size={18} className="text-love ml-0.5" />
          )}
        </button>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-foreground truncate">
            {tracks.length > 0 ? tracks[currentTrack]?.name : "未添加音乐"}
          </p>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-body w-8">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 rounded-full appearance-none bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-love cursor-pointer"
            />
            <span className="text-xs text-muted-foreground font-body w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <button
          onClick={toggleMute}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Upload music */}
        <label className="cursor-pointer text-muted-foreground hover:text-love transition-colors flex-shrink-0">
          {uploading ? (
            <Music size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
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
    </footer>
  );
};

export default MusicPlayer;
