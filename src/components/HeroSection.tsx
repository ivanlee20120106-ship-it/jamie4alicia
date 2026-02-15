import { useEffect, useState } from "react";
import MusicButton from "./MusicButton";
import HeartbeatHeart from "./HeartbeatHeart";

const getDaysTogether = (): number => {
  const now = new Date();
  const utc8Ms = now.getTime() + 8 * 3600000;
  const todayDays = Math.floor(utc8Ms / 86400000);
  const annivUtc8Ms = Date.UTC(2022, 8, 18) + 8 * 3600000;
  const annivDays = Math.floor(annivUtc8Ms / 86400000);
  return todayDays - annivDays + 1;
};

const getAnniversaryCount = (): number => {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600000);
  const year = utc8.getUTCFullYear();
  const month = utc8.getUTCMonth();
  const day = utc8.getUTCDate();
  let count = year - 2022;
  if (month < 8 || (month === 8 && day < 18)) count--;
  return Math.max(count, 0);
};

const getValentineCount = (): number => {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600000);
  const year = utc8.getUTCFullYear();
  const month = utc8.getUTCMonth();
  const day = utc8.getUTCDate();
  let count = year - 2022;
  if (month < 1 || (month === 1 && day < 14)) count--;
  return Math.max(count, 0);
};

const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const HeroSection = () => {
  const [days, setDays] = useState(getDaysTogether());
  const [anniversaries, setAnniversaries] = useState(getAnniversaryCount());
  const [valentines, setValentines] = useState(getValentineCount());

  useEffect(() => {
    const getMsUntilUtc8Midnight = () => {
      const now = new Date();
      const utc8Ms = now.getTime() + 8 * 3600000;
      const msSinceMidnight = utc8Ms % 86400000;
      return 86400000 - msSinceMidnight + 1000;
    };

    let timerId: ReturnType<typeof setTimeout>;
    const scheduleRefresh = () => {
      timerId = setTimeout(() => {
        setDays(getDaysTogether());
        setAnniversaries(getAnniversaryCount());
        setValentines(getValentineCount());
        scheduleRefresh();
      }, getMsUntilUtc8Midnight());
    };
    scheduleRefresh();

    return () => clearTimeout(timerId);
  }, []);

  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 pt-24 sm:pt-28 py-12 sm:py-20">
      {/* Names */}
      <h1 className="font-script text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-gradient-love glow-gold mb-8 sm:mb-12 animate-fade-in-up">
        Jamie & Alicia
      </h1>

      {/* Birthdays with hearts in between */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 md:gap-8 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <DateBadge date="1992.01.06" label="His Birthday" />
        <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
          <HeartbeatHeart variant="left" />
          <HeartbeatHeart variant="right" />
        </div>
        <DateBadge date="1994.10.21" label="Her Birthday" />
      </div>

      <MusicButton />

      {/* Anniversary */}
      <div className="mt-8 sm:mt-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <DateBadge date="2022.09.18" label="Anniversary" large />
      </div>

      {/* Milestones + Day counter */}
      <div className="mt-8 sm:mt-12 animate-fade-in-up flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 md:gap-10 w-full max-w-5xl px-4" style={{ animationDelay: "0.6s" }}>
        <MilestoneBadge
          ordinal={anniversaries}
          title="Anniversary"
          subtitle="We've celebrated our"
          suffix="anniversary"
        />

        <div className="text-center">
          <p className="text-muted-foreground text-sm sm:text-lg mb-2">We have been together for</p>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="font-display text-5xl sm:text-6xl md:text-8xl text-gradient-love font-bold glow-gold">
              {days}
            </span>
            <span className="text-xl sm:text-2xl text-gold">days</span>
          </div>
          <p className="text-muted-foreground text-lg mt-2">Every day is the best day</p>
        </div>

        <MilestoneBadge
          ordinal={valentines}
          title="Valentine's Day"
          subtitle="We've celebrated our"
          suffix="Valentine's Day"
        />
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
};

const MilestoneBadge = ({ ordinal, title, subtitle, suffix }: { ordinal: number; title: string; subtitle: string; suffix: string }) => (
  <div className="text-center px-6 py-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col justify-center min-w-[180px]">
    <p className="font-display text-2xl sm:text-3xl text-gold glow-gold">
      {getOrdinal(ordinal)} {title}
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      {subtitle} {getOrdinal(ordinal)} {suffix}
    </p>
  </div>
);

const DateBadge = ({ date, label, large }: { date: string; label: string; large?: boolean }) => (
  <div className={`text-center ${large ? "px-8 py-4" : "px-4 py-2"} rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm`}>
    <p className={`font-display ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"} text-gold glow-gold`}>
      {date}
    </p>
    <p className={`${large ? "text-base" : "text-sm"} text-muted-foreground mt-1`}>
      {label}
    </p>
  </div>
);

export default HeroSection;
