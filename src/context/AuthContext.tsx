"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthContextType } from "@/types/auth";
import { getBaseUrl } from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Create Supabase client with useMemo to ensure it's stable across renders
  const supabase = useMemo(() => {
    try {
      console.log('Creating Supabase client...');
      return createSupabaseBrowserClient();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      Sentry.captureException(error instanceof Error ? error : new Error('Failed to create Supabase client'), {
        level: 'error',
        tags: { component: 'AuthContext', issue: 'supabase_client_creation' },
      });
      return null;
    }
  }, []); // Only create once

  // If Supabase client creation failed, set loading to false immediately
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not available - setting loading to false');
      console.log('1 setting loading to false (no supabase client)');
      setLoading(false);
      return;
    }
  }, [supabase]);

  // Timeout fallback: if loading takes more than 5 seconds, stop loading
  // This is a safety net in case getSession() hangs
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing loading to false', { hasUser: !!user, loading });
        Sentry.captureMessage('AuthContext loading timeout - getSession may have hung', {
          level: 'warning',
          tags: { component: 'AuthContext', issue: 'loading_timeout' },
        });
        console.log('2 setting loading to false (timeout)');
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading, user]); // Re-run if loading state changes

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

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      console.log('AuthContext: Already initialized, skipping getSession');
      return;
    }

    console.log('AuthContext: useEffect running', {
      hasSupabase: !!supabase,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    // Get initial session
    const getSession = async () => {
      hasInitialized.current = true;

      try {
        console.log('getSession called', {
          env: typeof window !== 'undefined' ? 'browser' : 'server',
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasSupabaseClient: !!supabase,
          hypothesisId: 'A'
        });

        // Check if Supabase client is available
        if (!supabase) {
          console.error('Supabase client not available - cannot get session');
          Sentry.captureMessage('Supabase client not available - cannot get session', {
            level: 'error',
            tags: { component: 'AuthContext', issue: 'missing_supabase_client' },
          });
          setUser(null);
          console.log('3 setting loading to false (no client)');
          setLoading(false);
          return;
        }

        // Check if Supabase env vars are missing
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Missing Supabase environment variables');
          Sentry.captureMessage('Missing Supabase environment variables', {
            level: 'error',
            tags: { component: 'AuthContext' },
            extra: {
              hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
          });
          setUser(null);
          console.log('4 setting loading to false (no env vars)');
          setLoading(false);
          return;
        }

        // Wrap getSession in a timeout to prevent hanging
        console.log('Starting getSession with timeout');
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout after 3 seconds')), 3000)
        );

        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);

          const {
            data: { session },
            error,
          } = result as Awaited<ReturnType<typeof supabase.auth.getSession>>;

          console.log('getSession result', {
            hasError: !!error,
            errorMessage: error?.message,
            hasSession: !!session,
            userId: session?.user?.id,
            email: session?.user?.email,
            expiresAt: session?.expires_at,
            hypothesisId: 'A',
          });

          if (error) {
            console.error('getSession error path', error);
            setUser(null);
          } else if (session) {
            console.log('Setting user from session', session);
            setUser(session.user);
          } else {
            console.warn('No session found');
            setUser(null);
          }
        } catch (raceError) {
          // Handle timeout or other race errors
          if (raceError instanceof Error && raceError.message.includes('timeout')) {
            console.warn('getSession timed out after 3 seconds');
            setUser(null);
          } else {
            // Re-throw to be caught by outer catch
            throw raceError;
          }
        }
      } catch (error) {
        console.error('Unexpected error in getSession', error);
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          level: 'error',
          tags: { component: 'AuthContext', issue: 'getSession_error' },
        });
        setUser(null);
      } finally {
        console.log('5 setting loading to false (finally block)');
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    if (!supabase) {
      console.log('No supabase client, skipping auth state listener');
      return;
    }

    console.log('Setting up auth state change listener');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('onAuthStateChange fired', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        hypothesisId: 'B',
      });
      console.log("=== AUTH STATE CHANGE ===");
      console.log("Event:", event);
      console.log("User:", session?.user?.email);
      console.log("Session exists:", !!session);

      switch (event) {
        case "SIGNED_IN":
          console.log('SIGNED_IN event', { userId: session?.user?.id, hypothesisId: 'B' });
          setUser(session?.user ?? null);
          console.log('6 setting loading to false (SIGNED_IN)');
          setLoading(false);
          break;
        case "TOKEN_REFRESHED":
          console.log('TOKEN_REFRESHED event', { userId: session?.user?.id, hypothesisId: 'B' });
          setUser(session?.user ?? null);
          console.log('7 setting loading to false (TOKEN_REFRESHED)');
          setLoading(false);
          break;
        case "SIGNED_OUT":
          console.log('SIGNED_OUT event', { hypothesisId: 'B' });
          setUser(null);
          console.log('8 setting loading to false (SIGNED_OUT)');
          setLoading(false);
          break;
        case "USER_UPDATED":
          console.log('USER_UPDATED event', { userId: session?.user?.id, hypothesisId: 'B' });
          setUser(session?.user ?? null);
          // Don't set loading to false here as it might already be false
          break;
        case "MFA_CHALLENGE_VERIFIED":
          // Handle MFA if you implement it later
          break;
        default:
          // Unhandled event
          break;
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [supabase]); // Only depend on supabase, not supabase?.auth

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    // console.log("Attempting Supabase signUp with:", { email });

    try {
      // For development: try with additional options to bypass strict validation
      const { data, error } = await supabase.auth.signUp({
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
