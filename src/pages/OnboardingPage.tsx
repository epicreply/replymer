import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileText, Shield, Coins, Users, Sparkles, Zap, Check } from "lucide-react";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const selectedProjectId = useMemo(
    () => user?.projects?.find((project) => project.is_selected)?.id ?? null,
    [user],
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    websiteUrl: "",
    productDescription: "",
  });
  const [subredditInput, setSubredditInput] = useState("");
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  const suggestedSubreddits = ["marketing", "startups", "growthhacking", "entrepreneur"];

  const normalizeSubreddit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const withoutProtocol = trimmed.replace(/^https?:\/\/(www\.)?/i, "");
    const withoutDomain = withoutProtocol.replace(/^reddit\.com\//i, "");
    const withoutPrefix = withoutDomain.replace(/^r\//i, "");
    return withoutPrefix.replace(/\/+$/g, "");
  };

  const addSubreddit = (value: string) => {
    const normalized = normalizeSubreddit(value);
    if (!normalized) return;
    const exists = subreddits.some(
      (subreddit) => subreddit.toLowerCase() === normalized.toLowerCase(),
    );
    if (!exists) {
      setSubreddits((prev) => [...prev, normalized]);
    }
    setSubredditInput("");
  };

  const buildProjectUpdatePayload = () => ({
    name: formData.productName.trim() || null,
    website_url: formData.websiteUrl.trim() || null,
    description: formData.productDescription.trim() || null,
  });

  const handleContinue = async () => {
    if (currentStep === 2) {
      if (!accessToken || !selectedProjectId) {
        toast({
          title: "Unable to update project",
          description: "Missing authentication or project selection.",
          variant: "destructive",
        });
        return;
      }

      setIsUpdatingProject(true);
      try {
        const response = await fetch(
          `https://internal-api.autoreply.ing/v1.0/projects/${selectedProjectId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(buildProjectUpdatePayload()),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update project details");
        }

        await response.json();
        setCurrentStep(3);
      } catch (error) {
        console.error(error);
        toast({
          title: "Update failed",
          description: "We couldn't save your project details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdatingProject(false);
      }
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const canContinue = () => {
    if (currentStep === 1) return agreed;
    if (currentStep === 2) {
      return formData.productName && formData.websiteUrl && !isUpdatingProject;
    }
    if (currentStep === 3) return subreddits.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(180_60%_90%)] via-[hsl(280_40%_85%)] to-[hsl(330_60%_85%)] dark:from-[hsl(180_40%_20%)] dark:via-[hsl(280_30%_25%)] dark:to-[hsl(330_40%_25%)] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Step 1: Terms Agreement */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Welcome to Our Platform
              </h1>
              <Card className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-border flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Your use of this platform is subject to our{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Terms of Service
                    </a>
                    , the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      User Terms of Service
                    </a>
                    , the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Terms and Conditions
                    </a>
                    , and the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Privacy Policy
                    </a>
                    . By using this platform, you agree to abide by these Terms and Policies,
                    including the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Acceptable Use Policy
                    </a>
                    .
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-border flex items-center justify-center">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    You confirm that you will not use this platform or its output in any way that
                    violates these Terms or Policies and that you have obtained all necessary
                    rights, licenses, and consents to any content you upload.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Label htmlFor="agree" className="text-sm font-medium cursor-pointer">
                    I agree
                  </Label>
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: User Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Enter your details
              </h1>
              <Card className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      placeholder="Test Project"
                      value={formData.productName}
                      onChange={(e) =>
                        setFormData({ ...formData, productName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      placeholder="autopreply.ing"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productDescription">Product Description</Label>
                  <Textarea
                    id="productDescription"
                    placeholder="An AI-powered tool that helps businesses automate their social media outreach and lead generation."
                    value={formData.productDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, productDescription: e.target.value })
                    }
                    className="min-h-[140px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about features and benefits. This helps generate more relevant responses.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Subreddit Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                What subreddit do you want to search?
              </h1>
              <Card className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Add URL or name of subreddit you want to search. You can add more anytime.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="r/marketing"
                      value={subredditInput}
                      onChange={(e) => setSubredditInput(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addSubreddit(subredditInput)}
                      disabled={!subredditInput.trim()}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    Added subreddits
                  </h2>
                  {subreddits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No subreddits added yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subreddits.map((subreddit) => (
                        <span
                          key={subreddit}
                          className="rounded-full border border-border px-3 py-1 text-sm text-foreground"
                        >
                          r/{subreddit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    Suggested subreddits
                  </h2>
                  <div className="space-y-2">
                    {suggestedSubreddits.map((subreddit) => (
                      <div
                        key={subreddit}
                        className="flex items-center justify-between rounded-lg border border-border pl-4 pr-1 py-1"
                      >
                        <span className="text-sm font-medium text-foreground">
                          r/{subreddit}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSubreddit(subreddit)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Choose your plan
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Starter Plan */}
                <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Starter</h3>
                    <p className="text-3xl font-bold text-foreground">$19.99</p>
                    <p className="text-sm text-muted-foreground">Get started with basics.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">100 credits per month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">1 team member</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Basic features</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Get Starter
                  </Button>
                  <a href="#" className="text-xs text-center block text-muted-foreground underline">
                    Terms and conditions
                  </a>
                </Card>

                {/* Pro Plan */}
                <Card className="p-6 space-y-4 border-primary/50 hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Pro</h3>
                    <p className="text-3xl font-bold text-foreground">$49.99</p>
                    <p className="text-sm text-muted-foreground">Scale your business.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">500 credits per month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">5 team members</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Advanced features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                    Get Pro
                  </Button>
                  <a href="#" className="text-xs text-center block text-muted-foreground underline">
                    Terms and conditions
                  </a>
                </Card>

                {/* Enterprise Plan */}
                <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Enterprise</h3>
                    <p className="text-3xl font-bold text-foreground">Custom</p>
                    <p className="text-sm text-muted-foreground">Custom solutions for teams.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Early access to features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Unlimited team members</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Dedicated support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Custom integrations</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Talk to our team
                  </Button>
                  <a href="#" className="text-xs text-center block text-muted-foreground underline">
                    Terms and conditions
                  </a>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with step indicator and navigation */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {currentStep} of 4
          </span>
          <Button
            onClick={currentStep === 4 ? handleSkip : handleContinue}
            disabled={!canContinue()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white disabled:opacity-50"
          >
            {currentStep === 4 ? "Skip" : isUpdatingProject ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
