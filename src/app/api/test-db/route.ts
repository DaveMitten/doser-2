import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection...");

    const supabase = await createSupabaseServerClient();
    console.log("Supabase client created");

    // Test query to check if user_subscriptions table exists and is accessible
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("id, user_id, gocardless_customer_id")
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    console.log("Database query successful:", data);
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: data,
    });
  } catch (error) {
    console.error("Error testing database:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
