import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { Database } from "@/lib/database.types";

type UserSubscription =
  Database["public"]["Tables"]["user_subscriptions"]["Row"];
export async function GET() {
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

    // Get user's subscription from database
    const {
      data: subscription,
      error,
    }: { data: UserSubscription | null; error: Error | null } = (await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()) as { data: UserSubscription | null; error: Error | null };

    if (error || !subscription) {
      return NextResponse.json({
        subscription: null,
        hasActiveSubscription: false,
      });
    }

    return NextResponse.json({
      subscription,
      hasActiveSubscription: ["active", "trialing"].includes(
        subscription.status
      ),
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
