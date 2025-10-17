import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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

    // Update trial status for expired trials
    const { error } = await supabase
      .from("profiles")
      .update({
        trial_expired: true,
        subscription_status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("trial_expired", false)
      .lt(
        "trial_start_date",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) {
      console.error("Error updating trial status:", error);
      return NextResponse.json(
        { error: "Failed to update trial status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in trial status update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
