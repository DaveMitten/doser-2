import { SUBSCRIPTION_PLANS } from "./dodo-types";

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
  features: string[];
  description: string;
}

export class PlanService {
  private static planDescriptions: Record<string, string> = {
    learn: "Perfect for occasional users",
    track: "For regular users and enthusiasts",
    optimize: "For medical users and professionals",
  };

  /**
   * Get plan details by plan key (learn, track, optimize)
   */
  static getPlanDetails(
    planKey: string,
    isYearly: boolean = false
  ): PlanDetails | null {
    // console.log("getPlanDetails", { planKey, isYearly });
    const plan = SUBSCRIPTION_PLANS.find((plan) => plan.id === planKey);

    if (!plan) return null;

    return {
      id: plan.id,
      name: plan.name,
      price: isYearly ? plan.price.yearly : plan.price.monthly,
      currency: plan.currency,
      interval: plan.interval,
      trialDays: plan.trialDays,
      features: plan.features,
      description: this.planDescriptions[plan.name],
    };
  }

  /**
   * Get all available plans
   */
  static getAllPlans(isYearly: boolean = false): PlanDetails[] {
    return SUBSCRIPTION_PLANS.map((plan) => {
      return {
        id: plan.id,
        name: plan.name,
        price: isYearly ? plan.price.yearly : plan.price.monthly,
        currency: plan.currency,
        interval: plan.interval,
        trialDays: plan.trialDays,
        features: plan.features,
        description: this.planDescriptions[plan.name],
      };
    });
  }

  /**
   * Get plan key from Dodo product ID
   */
  static getPlanKeyFromDodoProductId(dodoProductId: string): string | null {
    for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (plan.id === dodoProductId) {
        return planKey;
      }
    }
    return null;
  }

  /**
   * Check if a plan is popular (for UI highlighting)
   */
  static isPopularPlan(planKey: string): boolean {
    return planKey === "track";
  }

  /**
   * Get plan features with proper formatting
   */
  static getFormattedFeatures(planKey: string): string[] {
    const plan = SUBSCRIPTION_PLANS.find((plan) => plan.id === planKey);
    if (!plan) return [];
    return plan?.features || [];
  }

  /**
   * Get price display string
   */
  static getPriceDisplay(planKey: string, isYearly: boolean = false): string {
    const plan = this.getPlanDetails(planKey, isYearly);
    if (!plan) return "£0";

    const symbol = plan.currency === "GBP" ? "£" : "€";
    return `${symbol}${plan.price}`;
  }

  /**
   * Get interval display string
   */
  static getIntervalDisplay(
    planKey: string,
    isYearly: boolean = false
  ): string {
    const plan = this.getPlanDetails(planKey, isYearly);
    return plan?.interval || "month";
  }
}
