import AuthDialog from "./AuthDialog";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signIn, signUp, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 pb-6 bg-background/80 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center justify-between px-4">
        <div className="w-24" />
        <h1 className="text-center font-script text-xl sm:text-3xl text-gradient-love glow-gold whitespace-nowrap">
          Our Love Journey
        </h1>
        <div className="w-24 flex justify-end">
          <AuthDialog user={user} onSignIn={signIn} onSignUp={signUp} onSignOut={signOut} />
        </div>
      </div>
    </header>
  );
};

export default Header;
