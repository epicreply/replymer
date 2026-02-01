import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = "82879988639-r6ivphpvputmu9mf4hspcumgjfai24sl.apps.googleusercontent.com";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://internal-api.autoreply.ing/v1.0/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      toast({
        title: "Magic link sent!",
        description: `Check your email at ${email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setIsGoogleLoading(true);
    try {
      // Call the Google sign-in API
      const response = await fetch("https://internal-api.autoreply.ing/v1.0/signin/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to sign in with Google");
      }

      const data = await response.json();

      // Fetch user details (same as magic link callback)
      const userResponse = await fetch("https://internal-api.autoreply.ing/v1.0/users/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await userResponse.json();

      // Store auth data and update context (same logic as signin/confirm)
      login(data.access_token, {
        id: data.user.id,
        email: userData.email,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || data.user.name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        theme: userData.theme,
        default_project_id: userData.default_project_id,
        team_member_status: data.user.team_member_status,
        projects: userData.projects,
        onboarding_completed: userData.onboarding_completed,
      });

      // Redirect to home or onboarding (same logic as signin/confirm)
      if (userData.onboarding_completed === false) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast({
        title: "Google Sign-In not available",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              handleGoogleCredential(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };

    // Wait for Google SDK to load
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      // Clean up interval after 10 seconds
      const timeout = setTimeout(() => clearInterval(checkGoogle), 10000);
      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 bg-background">
        <div className="max-w-md">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Autoreply logo"
            className="h-10 object-cover mb-10"
          />

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-3">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue managing your settings and preferences.
          </p>

          {/* Features */}
          <ul className="space-y-1 mb-8">
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Secure magic link authentication
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Quick Google sign-in option
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              No password required
            </li>
          </ul>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4 mb-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl gap-2"
              disabled={isLoading || !email}
            >
              {isLoading ? "Sending..." : "Send Magic Link"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Google Auth */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl gap-2"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          
        </div>
      </div>

      {/* Right side - Gradient */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[hsl(180_60%_90%)] via-[hsl(280_40%_85%)] to-[hsl(330_60%_85%)] dark:from-[hsl(180_40%_20%)] dark:via-[hsl(280_30%_25%)] dark:to-[hsl(330_40%_25%)] items-center justify-center p-12">
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 max-w-sm shadow-lg flex items-center gap-4">
          <p className="text-foreground">
            Manage your account settings and preferences with ease.
          </p>
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-background" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
