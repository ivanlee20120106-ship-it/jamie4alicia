import FloatingHearts from "@/components/FloatingHearts";
import HeroSection from "@/components/HeroSection";
import PhotoWall from "@/components/PhotoWall";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingHearts />
      <HeroSection />
      <PhotoWall />
    </div>
  );
};

export default Index;
