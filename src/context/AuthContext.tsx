"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthContextType } from "@/types/auth";
import { getBaseUrl } from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create supabase client once and memoize it
  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch (error) {
      console.error("[AuthProvider] Failed to create Supabase client:", error);
      Sentry.captureException(error, {
        tags: {
          component: "AuthProvider",
          action: "createSupabaseClient",
        },
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Timeout fallback - ensure loading doesn't hang forever
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("[AuthProvider] Auth initialization timeout");
        Sentry.captureMessage("Auth initialization timeout", {
          level: "warning",
          tags: {
            component: "AuthProvider",
            action: "initialization",
          },
        });
        setLoading(false);
      }
    }, 5000);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          clearTimeout(timeoutId);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          clearTimeout(timeoutId);
          console.error("[AuthProvider] Error getting session:", error);
          Sentry.captureException(error, {
            tags: {
              component: "AuthProvider",
              action: "getSession",
            },
          });
          setLoading(false);
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
      },
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getBaseUrl()}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
      },
    });
    if (error) throw error;
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerificationEmail,
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
