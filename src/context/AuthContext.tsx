"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthContextType } from "@/types/auth";
import { getBaseUrl } from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseBrowserClient> | null>(null);
  const hasInitialized = useRef(false);

  // Initialize Supabase client ONLY on client side, in useEffect
  useEffect(() => {
    // Skip everything on server - set loading false immediately
    if (typeof window === 'undefined') {
      console.log('[AUTH] Server-side render - setting loading false');
      setLoading(false);
      return;
    }

    console.log('[AUTH] Client-side: Initializing Supabase client');

    // Create client only on client
    let client: ReturnType<typeof createSupabaseBrowserClient> | null = null;
    try {
      client = createSupabaseBrowserClient();
      console.log('[AUTH] Supabase client created successfully');
      setSupabase(client);
    } catch (error) {
      console.error('[AUTH] Failed to create Supabase client:', error);
      Sentry.captureException(error instanceof Error ? error : new Error('Failed to create Supabase client'), {
        level: 'error',
        tags: { component: 'AuthContext', issue: 'supabase_client_creation' },
      });
      setLoading(false);
      return;
    }

    // Now get session
    const getSession = async () => {
      if (hasInitialized.current) {
        console.log('[AUTH] Already initialized, skipping');
        return;
      }

      hasInitialized.current = true;
      console.log('[AUTH] getSession called');

      // Hard timeout that ALWAYS runs
      const hardTimeout = setTimeout(() => {
        console.error('[AUTH] HARD TIMEOUT: 5 seconds - forcing loading false');
        setLoading(false);
      }, 5000);

      try {
        if (!client) {
          console.error('[AUTH] No client available');
          setLoading(false);
          clearTimeout(hardTimeout);
          return;
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('[AUTH] Missing env vars');
          setLoading(false);
          clearTimeout(hardTimeout);
          return;
        }

        console.log('[AUTH] Starting getSession');

        const sessionPromise = client.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), 3000)
        );

        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          const {
            data: { session },
            error,
          } = result as Awaited<ReturnType<typeof client.auth.getSession>>;

          console.log('[AUTH] getSession result', { hasError: !!error, hasSession: !!session });

          if (error) {
            console.error('[AUTH] getSession error:', error);
            setUser(null);
          } else if (session) {
            console.log('[AUTH] Setting user from session');
            setUser(session.user);
          } else {
            console.warn('[AUTH] No session found');
            setUser(null);
          }
        } catch (raceError) {
          if (raceError instanceof Error && raceError.message.includes('timeout')) {
            console.warn('[AUTH] getSession timed out');
            setUser(null);
          } else {
            throw raceError;
          }
        }
      } catch (error) {
        console.error('[AUTH] Unexpected error:', error);
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          level: 'error',
          tags: { component: 'AuthContext', issue: 'getSession_error' },
        });
        setUser(null);
      } finally {
        clearTimeout(hardTimeout);
        console.log('[AUTH] FINALLY: Setting loading to false');
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    if (!client) return;

    console.log('[AUTH] Setting up auth state listener');
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('[AUTH] Auth state change:', event);

      switch (event) {
        case "SIGNED_IN":
          setUser(session?.user ?? null);
          setLoading(false);
          break;
        case "TOKEN_REFRESHED":
          setUser(session?.user ?? null);
          setLoading(false);
          break;
        case "SIGNED_OUT":
          setUser(null);
          setLoading(false);
          break;
        case "USER_UPDATED":
          setUser(session?.user ?? null);
          break;
        default:
          break;
      }
    });

    return () => {
      console.log('[AUTH] Cleaning up');
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

  // Timeout fallback - additional safety net
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeout = setTimeout(() => {
      if (loading) {
        console.error('[AUTH] TIMEOUT FALLBACK: Forcing loading false');
        Sentry.captureMessage('AuthContext loading timeout - forcing false', {
          level: 'warning',
          tags: { component: 'AuthContext', issue: 'loading_timeout' },
        });
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

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

      if (message.includes("network") || message.includes("connection")) {
        return "Network error. Please check your connection and try again.";
      }

      // Return the original error message for other cases
      return error.message;
    }

    return "An unexpected error occurred. Please try again.";
  };


  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    // console.log("Attempting Supabase signUp with:", { email });

    try {
      // For development: try with additional options to bypass strict validation
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
          data: {
            email_verified: process.env.NODE_ENV === "development", // Auto-verify in dev
          },
        },
      });

      // console.log("Supabase signUp response:", { data, error });

      if (error) {
        // console.error("Supabase signUp error details:", {
        //   message: error.message,
        //   status: error.status,
        //   code: error.code || "No code provided",
        // });

        // Use the helper function to get user-friendly error messages
        throw new Error(getErrorMessage(error));
      }
    } catch (error) {
      // console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(getErrorMessage(error));
    } catch (error) {
      // console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(getErrorMessage(error));
    } catch (error) {
      // console.error("Reset password error:", error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${getBaseUrl()}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw new Error(getErrorMessage(error));
    } catch (error) {
      // console.error("Resend verification email error:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        // console.error("Session refresh error:", error);
        // If refresh fails, clear the user state
        setUser(null);
        throw error;
      }
      return data.session;
    } catch (error) {
      // console.error("Unexpected session refresh error:", error);
      setUser(null);
      throw error;
    }
  };

  const checkSessionValidity = async (): Promise<boolean> => {
    if (!supabase) {
      return false;
    }
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
      // console.error("Error checking session validity:", error);
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
    resendVerificationEmail,
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
