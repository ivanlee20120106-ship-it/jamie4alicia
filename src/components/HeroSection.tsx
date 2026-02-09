import { useEffect, useState } from "react";
import MusicButton from "./MusicButton";

const getDaysTogether = (): number => {
  // Use UTC+8 (China Standard Time)
  const now = new Date();
  const utc8Now = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000);
  const utc8Today = new Date(utc8Now.getFullYear(), utc8Now.getMonth(), utc8Now.getDate());
  const annivDate = new Date(2022, 8, 17); // Month is 0-indexed
  const diffMs = utc8Today.getTime() - annivDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const HeroSection = () => {
  const [days, setDays] = useState(getDaysTogether());

  useEffect(() => {
    const timer = setInterval(() => setDays(getDaysTogether()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
      {/* Names */}
      <h1 className="font-script text-5xl sm:text-7xl md:text-8xl text-gradient-love glow-gold mb-4 animate-fade-in-up">
        Jamie & Alica
      </h1>

      {/* Music Button */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <MusicButton />
      </div>

      {/* Dates */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <DateBadge date="1992.01.06" label="His Birthday" />
        <span className="text-love text-2xl flex items-center gap-1 animate-heartbeat">
          <span>♥</span>
          <span>♥</span>
        </span>
        <DateBadge date="1994.10.21" label="Her Birthday" />
      </div>

      {/* Anniversary */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <DateBadge date="2022.09.17" label="Anniversary" large />
      </div>

      {/* Day counter */}
      <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        <p className="text-muted-foreground text-lg mb-2">We have been together for</p>
        <div className="flex items-baseline gap-2 justify-center">
          <span className="font-display text-6xl sm:text-8xl text-gradient-love font-bold glow-gold">
            {days}
          </span>
          <span className="text-2xl text-gold">days</span>
        </div>
        <p className="text-muted-foreground text-lg mt-2">Every day is the best day ♥</p>
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
