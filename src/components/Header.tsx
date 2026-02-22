import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 pb-6 bg-background/80 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <Link to="/blog">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Blog</span>
            </Link>
          </Button>
        </div>
        <Link to="/">
          <h1 className="text-center font-script italic tracking-wide text-2xl sm:text-3xl text-gradient-love glow-gold">
            Our Love Journey
          </h1>
        </Link>
        <div className="flex items-center gap-1">
          {user && (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                <Link to="/blog/manage">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
