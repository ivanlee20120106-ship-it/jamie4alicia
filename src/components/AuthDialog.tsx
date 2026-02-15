import { useState } from "react";
import { createPortal } from "react-dom";
import { Heart, LogOut, X } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface AuthDialogProps {
  user: User | null;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
  onSignOut: () => Promise<void>;
}

const AuthDialog = ({ user, onSignIn, onSignUp, onSignOut }: AuthDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = isSignUp
      ? await onSignUp(email, password)
      : await onSignIn(email, password);
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else if (isSignUp) {
      toast.success("Check your email to confirm your account!");
      setIsOpen(false);
    } else {
      toast.success("Signed in!");
      setIsOpen(false);
    }
    setEmail("");
    setPassword("");
  };

  if (user) {
    return (
      <button
        onClick={onSignOut}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-300"
        title="Sign Out"
      >
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 rounded-full border border-gold/30 bg-card/40 backdrop-blur-sm hover:border-gold/60 hover:shadow-[0_0_16px_hsl(var(--gold)/0.25)] transition-all duration-300"
      >
        <Heart size={16} className="text-gold fill-gold/30 group-hover:fill-gold/60 transition-colors duration-300" />
        <span className="hidden sm:inline text-sm text-gold font-body italic">Sign In</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-love fill-love/40" />
                <h3 className="text-lg font-display italic text-foreground">{isSignUp ? "Create Account" : "Sign In"}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-love/50"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-love/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-love to-love-glow text-white font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-3 font-body italic text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AuthDialog;
