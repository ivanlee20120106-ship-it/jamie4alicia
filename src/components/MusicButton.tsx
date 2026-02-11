import { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MusicFile {
  name: string;
  url: string;
}

const MusicButton = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracks] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);

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
      audio.play().catch(() => {
        const startOnInteraction = () => {
          audio.play().catch(() => {});
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
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, tracks]);

  return <audio ref={audioRef} />;
};

export default MusicButton;
