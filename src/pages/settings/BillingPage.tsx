import { CreditCard, Check, Zap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For individuals just getting started",
    features: [
      "50 replies/month",
      "2 platforms",
      "Basic analytics",
      "Email support",
    ],
    icon: Zap,
    current: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For growing teams and businesses",
    features: [
      "200 replies/month",
      "All platforms",
      "Advanced analytics",
      "Priority support",
      "Custom prompts",
      "Team collaboration",
    ],
    icon: Zap,
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited replies",
      "All platforms",
      "White-label options",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    icon: Building,
    current: false,
  },
];

const billingHistory = [
  { date: "Jan 1, 2024", description: "Pro Plan - Monthly", amount: "$79.00", status: "Paid" },
  { date: "Dec 1, 2023", description: "Pro Plan - Monthly", amount: "$79.00", status: "Paid" },
  { date: "Nov 1, 2023", description: "Pro Plan - Monthly", amount: "$79.00", status: "Paid" },
];

export default function BillingPage() {
  const { usageQuota } = useLeads();
  const usagePercent = (usageQuota.used / usageQuota.limit) * 100;

  const handleUpgrade = (planName: string) => {
    toast({
      title: `Upgrade to ${planName}`,
      description: "This feature will be available soon.",
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
  
        {/* Current Plan & Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{usageQuota.plan}</p>
                <p className="text-sm text-muted-foreground">$79/month</p>
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
  
        {/* Plan Comparison */}
        <div>
          <h2 className="text-base font-medium text-foreground mb-4">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? "border-primary shadow-md" : ""}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-xs font-medium py-1 text-center rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <plan.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
  
        {/* Payment Method */}
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
  
        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
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
