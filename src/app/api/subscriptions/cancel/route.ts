import { NextResponse } from "next/server";
import { DodoService } from "@/lib/dodo-service";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription to find Dodo subscription ID
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("dodo_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.dodo_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel subscription using Dodo Payments
    const dodoService = new DodoService();
    const success = await dodoService.cancelSubscription(
      subscription.dodo_subscription_id
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
