export type PricingPlanKey = "starter" | "professional";

export type PricingPlan = {
  key: PricingPlanKey;
  name: string;
  monthlyPrice: number;
  periodLabel: string;
  description: string;
  features: string[];
  isPopular?: boolean;
};

export const WEBSITE_PRICING_PLANS: PricingPlan[] = [
  {
    key: "starter",
    name: "Starter",
    monthlyPrice: 19,
    periodLabel: "/mo",
    description: "For individuals and side projects getting started.",
    features: [
      "50 leads per day",
      "Track up to 10 subreddits",
      "AI reply generation",
      "Reddit & X support",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    monthlyPrice: 49,
    periodLabel: "/mo",
    description: "For teams that want unlimited leads and all platforms.",
    features: [
      "Unlimited leads",
      "Reddit, X & LinkedIn",
      "Track unlimited subreddits",
      "Custom brand voice",
      "API + Webhooks access",
      "MCP / agent integrations",
      "Priority support",
    ],
    isPopular: true,
  },
];

export const normalizePlanName = (planName: string | null | undefined) => {
  const normalized = planName?.trim().toLowerCase();

  if (!normalized) {
    return "Professional";
  }

  if (normalized === "pro" || normalized === "professional") {
    return "Professional";
  }

  if (normalized === "starter") {
    return "Starter";
  }

  return planName ?? "Professional";
};

export const getPlanByName = (planName: string | null | undefined) => {
  const normalizedName = normalizePlanName(planName);

  return (
    WEBSITE_PRICING_PLANS.find((plan) => plan.name === normalizedName) ??
    WEBSITE_PRICING_PLANS.find((plan) => plan.name === "Professional")
  );
};
