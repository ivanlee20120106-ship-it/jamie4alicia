import { useMemo } from "react";

const SWATCH_COLORS = [
  "hsl(34, 57%, 70%)",   // burlywood
  "hsl(28, 57%, 53%)",   // peru
  "hsl(34, 40%, 58%)",   // gold-soft
  "hsl(28, 65%, 62%)",   // love-glow
  "hsl(34, 57%, 75%)",   // lighter burlywood
  "hsl(28, 45%, 45%)",   // darker peru
];

const OrbitingSwatches = () => {
  const swatches = useMemo(() => {
    return SWATCH_COLORS.map((color, i) => {
      const angle = (360 / SWATCH_COLORS.length) * i;
      const orbitRadius = 20 + Math.random() * 12; // reduced for mobile safety
      const size = 60 + Math.random() * 80;
      const duration = 18 + Math.random() * 14;
      const delay = i * -3;
      const blur = 30 + Math.random() * 40;
      const wobbleX = 5 + Math.random() * 10;
      const wobbleY = 5 + Math.random() * 10;
      return { color, angle, orbitRadius, size, duration, delay, blur, wobbleX, wobbleY, id: i };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {swatches.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.color,
            opacity: 0.08,
            filter: `blur(${s.blur}px)`,
            top: "50%",
            left: "50%",
            animation: `orbit-${s.id} ${s.duration}s linear infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <style>{swatches.map((s) => `
        @keyframes orbit-${s.id} {
          0% {
            transform: translate(-50%, -50%) rotate(${s.angle}deg) translateX(${s.orbitRadius}vw) translateY(${s.wobbleY}vh);
          }
          25% {
            transform: translate(-50%, -50%) rotate(${s.angle + 90}deg) translateX(${s.orbitRadius * 0.85}vw) translateY(-${s.wobbleX}vh);
          }
          50% {
            transform: translate(-50%, -50%) rotate(${s.angle + 180}deg) translateX(${s.orbitRadius * 1.1}vw) translateY(${s.wobbleY * 0.7}vh);
          }
          75% {
            transform: translate(-50%, -50%) rotate(${s.angle + 270}deg) translateX(${s.orbitRadius * 0.9}vw) translateY(-${s.wobbleX * 0.5}vh);
          }
          100% {
            transform: translate(-50%, -50%) rotate(${s.angle + 360}deg) translateX(${s.orbitRadius}vw) translateY(${s.wobbleY}vh);
          }
        }
      `).join("")}</style>
    </div>
  );
};

export default OrbitingSwatches;
