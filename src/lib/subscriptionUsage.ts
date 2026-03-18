import type { AvailablePlan, SubscriptionSummaryResponse } from "@/lib/api";

const PRO_PROGRESS_MAX = 999;

export const normalizePlanCode = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? "";

export const isProfessionalCode = (code: string) =>
  code === "pro" || code === "professional";

export const isStarterLikeCode = (code: string) =>
  code === "starter" || code === "free_trial";

export const resolveCurrentPlan = (
  subscription: SubscriptionSummaryResponse | null | undefined
): AvailablePlan | null => {
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

  return currentPlanByFlag ?? currentPlanByCode ?? null;
};

export interface SubscriptionUsageSnapshot {
  used: number;
  limit: number;
  unlimited: boolean;
  label: string;
  progressPercent: number;
  isProfessionalCurrentPlan: boolean;
}

export const mapSubscriptionUsage = (
  subscription: SubscriptionSummaryResponse | null | undefined
): SubscriptionUsageSnapshot => {
  const currentPlan = resolveCurrentPlan(subscription);
  const isProfessionalCurrentPlan = isProfessionalCode(
    normalizePlanCode(currentPlan?.code ?? subscription?.current_plan.plan)
  );

  const used = subscription?.usage.leads_used ?? subscription?.usage.replies_used ?? 0;
  const limit =
    subscription?.usage.leads_limit ?? subscription?.usage.replies_limit ?? 0;
  const unlimited =
    subscription?.usage.leads_unlimited ??
    subscription?.usage.replies_unlimited ??
    false;

  const label = unlimited ? `${used} leads` : `${used} / ${limit} leads`;
  const usagePercentLimit = isProfessionalCurrentPlan ? PRO_PROGRESS_MAX : limit;
  const progressPercent =
    usagePercentLimit <= 0
      ? 0
      : Math.min(100, Math.max(0, (used / usagePercentLimit) * 100));

  return {
    used,
    limit,
    unlimited,
    label,
    progressPercent,
    isProfessionalCurrentPlan,
  };
};
