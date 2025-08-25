"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthContextType } from "@/types/auth";
import { getAuthCallbackUrl } from "@/lib/utils";
import { getCookie, deleteCookie } from "@/lib/cookie-utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check for email verification cookie
    const checkVerificationCookie = () => {
      const verifiedCookie = getCookie("email_verified");

      if (verifiedCookie) {
        // Clear the cookie
        deleteCookie("email_verified");

        // Refresh the session to ensure we have the latest user state
        supabase.auth.refreshSession();
      }
    };

    checkVerificationCookie();
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          // If there's an error, clear the user state
          setUser(null);
        } else if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);

      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          setUser(session?.user ?? null);
          setLoading(false);
          break;
        case "SIGNED_OUT":
          setUser(null);
          setLoading(false);
          // Clear any remaining cookies
          deleteCookie("email_verified");
          break;
        case "USER_UPDATED":
          setUser(session?.user ?? null);
          break;
        case "MFA_CHALLENGE_VERIFIED":
          // Handle MFA if you implement it later
          break;
        default:
          console.log("Unhandled auth event:", event);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signUp = async (email: string, password: string) => {
    console.log("Attempting Supabase signUp with:", { email });

    try {
      // For development: try with additional options to bypass strict validation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
          data: {
            email_verified: process.env.NODE_ENV === "development", // Auto-verify in dev
          },
        },
      });

      console.log("Supabase signUp response:", { data, error });

      if (error) {
        console.error("Supabase signUp error details:", {
          message: error.message,
          status: error.status,
          code: error.code || "No code provided",
        });
        throw error;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Clear any verification cookies on successful sign in
      deleteCookie("email_verified");
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear any verification cookies on sign out
    deleteCookie("email_verified");
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        // If refresh fails, clear the user state
        setUser(null);
        throw error;
      }
      return data.session;
    } catch (error) {
      console.error("Unexpected session refresh error:", error);
      setUser(null);
      throw error;
    }
  };

  const checkSessionValidity = async (): Promise<boolean> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return false;
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking session validity:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession,
    checkSessionValidity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
