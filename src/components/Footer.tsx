const Footer = () => {
  return (
    <footer className="relative z-10 py-8 text-center" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
      <div className="bg-card/60 backdrop-blur-sm border-t border-border/30 py-6 px-4">
        <p className="font-body text-sm tracking-wide" style={{ color: "hsl(var(--gold-soft))" }}>
          © 2026{" "}
          <span className="font-script text-base" style={{ color: "hsl(var(--gold))" }}>
            Jamie & Alicia
          </span>
          .{" "}
          <span className="font-script text-base" style={{ color: "hsl(var(--love-glow))" }}>
            晚安！爱你！每一天！
          </span>{" "}
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
