import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const MagicLinkCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyMagicLink = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setError("Invalid magic link. Missing token or email.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch("https://internal-api.autoreply.ing/v1.0/signin/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify magic link");
        }

        const data = await response.json();
        
        // Store auth data and update context
        login(data.access_token, data.user);
        
        // Redirect to home
        navigate("/", { replace: true });
      } catch (err) {
        setError("This link has expired or is invalid. Please request a new one.");
        setIsVerifying(false);
      }
    };

    verifyMagicLink();
  }, [searchParams, login, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Verifying your login...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Link Expired or Invalid</h1>
        <p className="text-muted-foreground text-center mb-6 max-w-md">{error}</p>
        <Button onClick={() => navigate("/auth", { replace: true })}>
          Back to Login
        </Button>
      </div>
    );
  }

  return null;
};

export default MagicLinkCallback;
