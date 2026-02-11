interface HeartbeatHeartProps {
  variant: "left" | "right";
  className?: string;
}

const ECG_POINTS = "0,30 10,30 20,30 30,30 35,30 38,20 42,40 45,10 48,45 52,25 55,30 65,30 75,30 85,30 90,30 95,30 100,30";

const HeartbeatHeart = ({ variant, className = "" }: HeartbeatHeartProps) => {
  // Swap colors: left uses gold, right uses love
  const colorVar = variant === "left" ? "--gold" : "--love";
  const strokeColor = `hsl(var(${colorVar}))`;
  const glowColor = variant === "left" ? "hsl(var(--gold-soft))" : "hsl(var(--love-glow))";
  const animClass = variant === "left" ? "animate-heartbeat-left" : "animate-heartbeat-right";
  // Right heart is 158/173 ≈ 0.913 of left heart size
  const sizeClass = variant === "left"
    ? "w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
    : "w-[73px] h-[73px] sm:w-[102px] sm:h-[102px] md:w-[117px] md:h-[117px]";
  const ecgWidth = variant === "left"
    ? "w-20 sm:w-28 md:w-32"
    : "w-[73px] sm:w-[102px] md:w-[117px]";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Heart SVG with heartbeat animation */}
      <div
        className={animClass}
        style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
      >
        <svg
          viewBox="0 0 200 200"
          className={sizeClass}
          fill="none"
        >
          <path
            d="M100,180 C60,140 10,120 10,80 C10,40 40,20 70,20 C85,20 95,30 100,40 C105,30 115,20 130,20 C160,20 190,40 190,80 C190,120 140,140 100,180Z"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-heart-draw"
          />
        </svg>
      </div>

      {/* ECG waveform */}
      <div className={`${ecgWidth} h-8 sm:h-10 mt-1.5 rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm`}>
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-[200%] h-full animate-ecg-scroll">
          <polyline
            points={ECG_POINTS}
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Duplicate for seamless loop */}
          <polyline
            points={ECG_POINTS.split(" ").map(p => {
              const [x, y] = p.split(",");
              return `${parseFloat(x) + 100},${y}`;
            }).join(" ")}
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeartbeatHeart;
