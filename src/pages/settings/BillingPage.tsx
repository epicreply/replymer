import { CreditCard, Check, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

const billingHistory = [
  { date: "Jan 1, 2024", description: "Professional Plan - Monthly", amount: "$49.00", status: "Paid" },
  { date: "Dec 1, 2023", description: "Professional Plan - Monthly", amount: "$49.00", status: "Paid" },
  { date: "Nov 1, 2023", description: "Professional Plan - Monthly", amount: "$49.00", status: "Paid" },
];

const normalizePlanCode = (value: string | null | undefined) => value?.trim().toLowerCase() ?? "";

const isProfessionalCode = (code: string) => code === "pro" || code === "professional";
const isStarterLikeCode = (code: string) => code === "starter" || code === "free_trial";

const toDisplayPlanName = (value: string | null | undefined) => {
  if (!value) {
    return "Unknown Plan";
  }

  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
};

const formatPrice = (amountCents: number | null | undefined, currency: string | null | undefined) => {
  if (amountCents == null) {
    return null;
  }

  const currencyCode = (currency ?? "usd").toUpperCase();
  const fractionDigits = amountCents % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountCents / 100);
};

const formatInterval = (interval: string | null | undefined) => {
  if (!interval) {
    return "";
  }

  if (interval === "month") {
    return "/mo";
  }

  return `/${interval}`;
};

export default function BillingPage() {
  const navigate = useNavigate();
  const { data: subscription, isLoading } = useSubscription();

  const availablePlans = subscription?.available_plans ?? [];
  const currentPlanCode = normalizePlanCode(subscription?.current_plan.plan);
  const currentPlanByFlag = availablePlans.find((plan) => plan.is_current);
  const currentPlanByCode = availablePlans.find((plan) => {
    const normalizedCode = normalizePlanCode(plan.code);
    return (
      normalizedCode === currentPlanCode ||
      (isStarterLikeCode(currentPlanCode) && normalizedCode === "starter")
    );
  });
  const currentPlan = currentPlanByFlag ?? currentPlanByCode ?? null;
  const isProfessionalCurrentPlan = isProfessionalCode(
    normalizePlanCode(currentPlan?.code ?? subscription?.current_plan.plan),
  );

  const currentPlanName = currentPlan?.name ?? toDisplayPlanName(subscription?.current_plan.plan);
  const currentPlanPrice = formatPrice(
    subscription?.current_plan.amount_cents ?? currentPlan?.amount_cents,
    subscription?.current_plan.currency ?? currentPlan?.currency,
  );
  const currentPlanPeriod = formatInterval(currentPlan?.interval);

  const usageUsed = subscription?.usage.leads_used ?? subscription?.usage.replies_used ?? 0;
  const usageLimit = subscription?.usage.leads_limit ?? subscription?.usage.replies_limit ?? 0;
  const usageUnlimited = subscription?.usage.leads_unlimited ?? subscription?.usage.replies_unlimited ?? false;
  const usageLabel = usageUnlimited ? `${usageUsed} leads` : `${usageUsed} / ${usageLimit} leads`;
  const usagePercent =
    usageUnlimited || usageLimit <= 0 ? 0 : Math.min(100, Math.max(0, (usageUsed / usageLimit) * 100));

  const resetDateStr = subscription?.usage.reset_at;
  const resetDate = resetDateStr
    ? new Date(resetDateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  const navigateToUrl = (url: string | null, title: string) => {
    if (!url) {
      toast({
        title,
        description: "Action is not available for this subscription.",
        variant: "destructive",
      });
      return;
    }

    if (url.startsWith("/")) {
      navigate(url);
      return;
    }

    window.location.href = url;
  };

  const currentPlanAction = isProfessionalCurrentPlan
    ? subscription?.actions.manage_subscription_url
      ? { label: "Manage Subscription", url: subscription.actions.manage_subscription_url }
      : null
    : subscription?.actions.upgrade_url
      ? { label: "Upgrade", url: subscription.actions.upgrade_url }
      : null;

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{currentPlanName}</p>
                <p className="text-sm text-muted-foreground">
                  {currentPlanPrice ?? "Custom"}{currentPlanPeriod}
                </p>
              </div>
              {currentPlanAction ? (
                <Button
                  variant="outline"
                  onClick={() => navigateToUrl(currentPlanAction.url, currentPlanAction.label)}
                >
                  {currentPlanAction.label}
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leads quota used</span>
                <span className="font-medium">{usageLabel}</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Resets on {resetDate}
              </p>
            </div>
          </CardContent>
        </Card>

        {!isProfessionalCurrentPlan ? (
          <div>
            <h2 className="mb-4 text-base font-medium text-foreground">Available Plans</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {availablePlans.map((plan) => {
                const normalizedPlanCode = normalizePlanCode(plan.code);
                const isCurrentPlan =
                  plan.is_current ||
                  normalizedPlanCode === currentPlanCode ||
                  (isStarterLikeCode(currentPlanCode) && normalizedPlanCode === "starter");
                const isProfessionalPlan = isProfessionalCode(normalizedPlanCode);
                const buttonLabel = isCurrentPlan ? "Current Plan" : isProfessionalPlan ? "Upgrade" : "Choose Plan";
                const targetUrl = isProfessionalPlan
                  ? subscription?.actions.upgrade_url
                  : subscription?.actions.manage_subscription_url ?? subscription?.actions.upgrade_url;
                const hasAction = Boolean(targetUrl);

                return (
                  <Card
                    key={plan.code}
                    className={`flex h-full flex-col ${isProfessionalPlan ? "border-[#ff5f3a] shadow-md" : ""}`}
                  >
                    {isProfessionalPlan ? (
                      <div className="rounded-t-lg bg-[#ff5f3a] py-1 text-center text-xs font-medium text-white">
                        Most popular
                      </div>
                    ) : null}
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#ff5f3a]" />
                        <CardTitle className="text-lg uppercase tracking-wider">{plan.name}</CardTitle>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-2">
                        <span className="text-3xl font-bold">{formatPrice(plan.amount_cents, plan.currency) ?? "Custom"}</span>
                        <span className="text-muted-foreground">{formatInterval(plan.interval)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-emerald-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={isProfessionalPlan ? "mt-auto w-full bg-[#ff5f3a] text-white hover:bg-[#ff5630]" : "mt-auto w-full"}
                        variant={isCurrentPlan ? "outline" : "default"}
                        disabled={isCurrentPlan || !hasAction}
                        onClick={() => navigateToUrl(targetUrl, buttonLabel)}
                      >
                        {buttonLabel}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border py-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.amount}</p>
                    <p className="text-xs text-primary">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
