"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthContextType } from "@/types/auth";
import { getBaseUrl } from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Supabase client with error handling
  let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null;
  let supabaseCreationError: Error | null = null;
  try {
    supabase = createSupabaseBrowserClient();
  } catch (error) {
    // #region agent log
    Sentry.captureException(error instanceof Error ? error : new Error('Failed to create Supabase client'), {
      level: 'error',
      tags: { component: 'AuthContext', issue: 'supabase_client_creation' },
    });
    // #endregion
    // Store error to handle in useEffect (can't call setState during render)
    supabaseCreationError = error instanceof Error ? error : new Error('Failed to create Supabase client');
    console.error('Failed to create Supabase client:', error);
  }

  // If Supabase client creation failed, set loading to false immediately
  useEffect(() => {
    if (supabaseCreationError) {
      console.error('Supabase client creation failed - setting loading to false', supabaseCreationError.message);
      console.log('1 setting loading to false ');
      setLoading(false);
    }
  }, []); // Run once on mount

  // Timeout fallback: if loading takes more than 3 seconds, stop loading
  // This is a safety net in case getSession() hangs
  useEffect(() => {
    const timeout = setTimeout(() => {
      // #region agent log
      console.warn('Auth loading timeout - forcing loading to false', { hasUser: !!user, loading });
      Sentry.captureMessage('AuthContext loading timeout - getSession may have hung', {
        level: 'warning',
        tags: { component: 'AuthContext', issue: 'loading_timeout' },
      });
      // #endregion
      console.log('2 setting loading to false ');
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []); // Run once on mount, don't depend on loading/user

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
    // Get initial session
    const getSession = async () => {
      try {
        // #region agent log
        console.log('getSession called', {
          env: typeof window !== 'undefined' ? 'browser' : 'server',
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasSupabaseClient: !!supabase,
          hypothesisId: 'A'
        });
        // #endregion

        // Check if Supabase client is available
        if (!supabase) {
          // #region agent log
          Sentry.captureMessage('Supabase client not available - cannot get session', {
            level: 'error',
            tags: { component: 'AuthContext', issue: 'missing_supabase_client' },
          });
          // #endregion
          setUser(null);
          console.log('3 setting loading to false ');
          setLoading(false);
          return;
        }

        // Check if Supabase env vars are missing
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          // #region agent log
          Sentry.captureMessage('Missing Supabase environment variables', {
            level: 'error',
            tags: { component: 'AuthContext' },
            extra: {
              hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
          });
          // #endregion
          setUser(null);
          console.log('4 setting loading to false ');
          setLoading(false);
          return;
        }

        // Wrap getSession in a timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout after 3 seconds')), 3000)
        );

        console.log('Starting getSession with timeout');

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
            // If there's an error, clear the user state
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
        setUser(null);
      } finally {
        console.log('5 setting loading to false ');
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    if (!supabase) {
      setLoading(false);
      return () => { }; // Return empty cleanup function
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      // #region agent log
      console.log('onAuthStateChange fired', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        hypothesisId: 'B',
      });
      // #endregion
      console.log("=== AUTH STATE CHANGE ===");
      console.log("Event:", event);
      console.log("User:", session?.user?.email);
      console.log("Session exists:", !!session);

      switch (event) {
        case "SIGNED_IN":
          // console.log("✅ User signed in");
          // #region agent log
          console.log('SIGNED_IN event', { userId: session?.user?.id, hypothesisId: 'B' });
          // #endregion
          setUser(session?.user ?? null);
          console.log('6 setting loading to false ');
          setLoading(false);
          break;
        case "TOKEN_REFRESHED":
          // console.log("🔄 Token refreshed");
          // #region agent log
          console.log('TOKEN_REFRESHED event', { userId: session?.user?.id, hypothesisId: 'B' });
          // #endregion
          setUser(session?.user ?? null);
          console.log('7 setting loading to false ');
          setLoading(false);
          break;
        case "SIGNED_OUT":
          // console.log("👋 User signed out");
          // #region agent log
          console.log('SIGNED_OUT event', { hypothesisId: 'B' });
          // #endregion
          setUser(null);
          console.log('8 setting loading to false ');
          setLoading(false);
          break;
        case "USER_UPDATED":
          // console.log("👤 User updated");
          // #region agent log


          console.log('USER_UPDATED event', { userId: session?.user?.id, hypothesisId: 'B' });
          // #endregion
          console.log('9 setting loading to false ');
          setUser(session?.user ?? null);
          break;
        case "MFA_CHALLENGE_VERIFIED":
          // Handle MFA if you implement it later
          // console.log("🔐 MFA verified");
          break;
        default:
        // console.log("⚠️ Unhandled auth event:", event);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase?.auth]);

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
