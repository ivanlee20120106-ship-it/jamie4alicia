import FloatingHearts from "@/components/FloatingHearts";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PhotoWall from "@/components/PhotoWall";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Radial gradient background texture */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--love)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--gold)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--love-glow)/0.08),transparent_40%)]" />
      </div>
      <FloatingHearts />
      <Header />
      <HeroSection />
      <PhotoWall />
    </div>
  );
};

export default Index;
