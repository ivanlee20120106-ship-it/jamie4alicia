import { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Music, VolumeOff } from "lucide-react";

interface MusicFile {
  name: string;
  url: string;
}

const MusicButton = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracks] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const interactionListenerRef = useRef<(() => void) | null>(null);
  const INTERACTION_EVENTS = ['click', 'touchstart', 'pointerdown', 'scroll', 'keydown'];

  const removeInteractionListeners = useCallback(() => {
    const listener = interactionListenerRef.current;
    if (listener) {
      INTERACTION_EVENTS.forEach(e => document.removeEventListener(e, listener));
      interactionListenerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    audio.src = tracks[currentTrack]?.url || "";
    audio.load();

    const handleEnded = () => {
      if (tracks.length > 1) {
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
      } else {
        audio.currentTime = 0;
        audio.play();
      }
    };

    audio.addEventListener("ended", handleEnded);

    const tryPlay = () => {
      audio.play().then(() => {
        setIsPlaying(true);
        removeInteractionListeners();
      }).catch(() => {
        removeInteractionListeners();
        const startOnInteraction = () => {
          audio.play().then(() => {
            setIsPlaying(true);
            removeInteractionListeners();
          }).catch(() => {
            // keep listeners for retry
          });
        };
        interactionListenerRef.current = startOnInteraction;
        INTERACTION_EVENTS.forEach(e =>
          document.addEventListener(e, startOnInteraction, { passive: true })
        );
      });
    };

    tryPlay();

    return () => {
      audio.removeEventListener("ended", handleEnded);
      removeInteractionListeners();
    };
  }, [currentTrack, tracks, removeInteractionListeners]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} />
      <button
        onClick={toggle}
        className="fixed bottom-20 left-6 z-50 w-12 h-12 rounded-full bg-background/60 backdrop-blur-md border border-border/50 flex items-center justify-center text-2xl shadow-lg hover:bg-background/80 transition-all duration-300"
        aria-label={isPlaying ? "暂停音乐" : "播放音乐"}
      >
        {isPlaying ? <Music size={20} className="text-gold" /> : <VolumeOff size={20} className="text-muted-foreground" />}
      </button>
    </>
  );
};

export default MusicButton;
