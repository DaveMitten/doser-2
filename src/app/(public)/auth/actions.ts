"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getBaseUrl } from "@/lib/utils";

// Helper function to get user-friendly error messages
const getErrorMessage = (
  error: { message?: string } | null | undefined
): string => {
  if (error?.message) {
    const message = error.message.toLowerCase();

    if (
      message.includes("user already registered") ||
      message.includes("already exists") ||
      message.includes("duplicate key") ||
      message.includes("23505")
    ) {
      return "An account with this email already exists. Please sign in instead.";
    }

    if (message.includes("invalid email")) {
      return "Please enter a valid email address.";
    }

    if (message.includes("password")) {
      return "Password must be at least 6 characters long.";
    }

    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return "Too many signup attempts. Please wait a moment and try again.";
    }

    // Return the original error message for other cases
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { success: false, error: getErrorMessage(error) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    // Use the helper function to get user-friendly error messages
    return { success: false, error: getErrorMessage(error) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/reset-password`,
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return { message: "Password reset email sent" };
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return { message: "Verification email sent" };
}

export async function checkEmailExists(email: string) {
  const supabase = await createSupabaseServerClient();

  try {
    // Check if email exists in profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which means email doesn't exist
      console.error("Error checking email:", error);
      throw new Error("Failed to check email availability");
    }

    // If data exists, email is taken
    return { exists: !!data, email };
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw new Error("Failed to check email availability");
  }
}
