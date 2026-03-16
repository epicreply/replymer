import { CreditCard, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "@/hooks/use-toast";
import { WEBSITE_PRICING_PLANS, getPlanByName } from "@/constants/pricingPlans";

const billingHistory = [
  { date: "Jan 1, 2024", description: "Professional Plan - Monthly", amount: "$49.00", status: "Paid" },
  { date: "Dec 1, 2023", description: "Professional Plan - Monthly", amount: "$49.00", status: "Paid" },
  { date: "Nov 1, 2023", description: "Professional Plan - Monthly", amount: "$49.00", status: "Paid" },
];

export default function BillingPage() {
  const { usageQuota } = useLeads();
  const usagePercent = (usageQuota.used / usageQuota.limit) * 100;
  const currentPlan = getPlanByName(usageQuota.plan);

  const handleUpgrade = (planName: string) => {
    toast({
      title: `Start ${planName} free trial`,
      description: "Checkout is coming soon.",
    });
  };

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
                <p className="text-2xl font-bold text-foreground">{currentPlan?.name}</p>
                <p className="text-sm text-muted-foreground">${currentPlan?.monthlyPrice}{currentPlan?.periodLabel}</p>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reply quota used</span>
                <span className="font-medium">
                  {usageQuota.used} / {usageQuota.limit} replies
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Resets on February 1, 2024
              </p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-base font-medium text-foreground">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {WEBSITE_PRICING_PLANS.map((plan) => {
              const isCurrentPlan = plan.name === currentPlan?.name;

              return (
                <Card
                  key={plan.key}
                  className={`h-full flex flex-col ${plan.isPopular ? "border-[#ff5f3a] shadow-md" : ""}`}
                >
                  {plan.isPopular && (
                    <div className="rounded-t-lg bg-[#ff5f3a] py-1 text-center text-xs font-medium text-white">
                      Most popular
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#ff5f3a]" />
                      <CardTitle className="text-lg uppercase tracking-wider">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                      <span className="text-muted-foreground">{plan.periodLabel}</span>
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
                      className={plan.isPopular ? "mt-auto w-full bg-[#ff5f3a] text-white hover:bg-[#ff5630]" : "mt-auto w-full"}
                      variant={isCurrentPlan ? "outline" : "default"}
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {isCurrentPlan ? "Current Plan" : "Start free trial"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

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
