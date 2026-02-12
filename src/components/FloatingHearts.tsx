import { useMemo } from "react";

const HEART_COLORS = [
  "text-love",
  "text-love-glow",
  "text-primary",
  "text-secondary",
  "text-accent",
  "text-gold",
  "text-blue-300",
  "text-sky-400",
  "text-amber-400",
  "text-orange-300",
  "text-indigo-300",
  "text-yellow-600",
];

const FloatingHearts = () => {
  const hearts = useMemo(() => {
    return Array.from({ length: 65 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: 12 + Math.random() * 20,
      opacity: (0.2 + Math.random() * 0.3) * 0.5,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      rotateStart: Math.floor(Math.random() * 360),
      rotateEnd: Math.floor(Math.random() * 720) - 360,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <span
          key={h.id}
          className={`absolute bottom-0 ${h.color} animate-float-heart-spin`}
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            opacity: h.opacity,
            "--rotate-start": `${h.rotateStart}deg`,
            "--rotate-end": `${h.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" width={h.size} height={h.size} fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </span>
      ))}
    </div>
  );
};

export default FloatingHearts;
