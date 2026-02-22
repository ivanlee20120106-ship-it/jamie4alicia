import { Link } from "react-router-dom";

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
            Good Night! Love You! Every Single Day!
          </span>{" "}
          All rights reserved.
        </p>
        <Link
          to="/admin/login"
          className="inline-block mt-2 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
