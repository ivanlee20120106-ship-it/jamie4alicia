import FloatingHearts from "@/components/FloatingHearts";
import HeroSection from "@/components/HeroSection";
import PhotoWall from "@/components/PhotoWall";
import MusicPlayer from "@/components/MusicPlayer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pb-20">
      <FloatingHearts />
      <HeroSection />
      <PhotoWall />
      <MusicPlayer />
    </div>
  );
};

export default Index;
