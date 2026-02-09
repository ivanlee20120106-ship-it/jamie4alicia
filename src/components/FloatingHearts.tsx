import { useMemo } from "react";

const HEART_COLORS = [
  "text-love",
  "text-love-glow", 
  "text-gold",
  "text-gold-soft",
  "text-primary",
  "text-accent",
];

const FloatingHearts = () => {
  const hearts = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${8 + Math.random() * 8}s`,
      size: 12 + Math.random() * 20,
      opacity: 0.2 + Math.random() * 0.3,
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
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            "--rotate-start": `${h.rotateStart}deg`,
            "--rotate-end": `${h.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          ♥
        </span>
      ))}
    </div>
  );
};

export default FloatingHearts;
