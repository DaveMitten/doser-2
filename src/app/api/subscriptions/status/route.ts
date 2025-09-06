import { NextRequest, NextResponse } from "next/server";
import { getMollieService } from "@/lib/mollie-service";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function GET(request: NextRequest) {
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

    // Get user's subscription
    const mollieService = getMollieService();
    const subscription = await mollieService.getUserSubscription(user.id);

    if (!subscription) {
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
