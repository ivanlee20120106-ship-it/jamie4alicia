import { useState } from "react";
import { LogIn, LogOut, X } from "lucide-react";
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
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 text-sm text-foreground"
      >
        <LogOut size={16} className="text-gold" />
        Sign Out
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 text-sm text-foreground"
      >
        <LogIn size={16} className="text-gold" />
        Sign In
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display text-foreground">{isSignUp ? "Create Account" : "Sign In"}</h3>
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
                className="w-full py-2 rounded-lg bg-love text-white text-sm font-medium hover:bg-love/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthDialog;
