import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Session } from "@supabase/supabase-js";

export interface UseSessionReturn {
  session: Session | null;
  isValid: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  checkValidity: () => Promise<boolean>;
}

/**
 * Custom hook for managing authentication session state
 * Provides session validation, refresh capabilities, and loading states
 */
export function useSession(): UseSessionReturn {
  const { user, loading, refreshSession, checkSessionValidity } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      if (!user) {
        setSession(null);
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      try {
        const valid = await checkSessionValidity();
        setIsValid(valid);

        if (valid) {
          // Get the current session
          const {
            data: { session },
          } = await import("@/lib/supabase-browser").then(
            ({ createSupabaseBrowserClient }) => {
              const supabase = createSupabaseBrowserClient();
              return supabase.auth.getSession();
            }
          );
          setSession(session);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Session validation error:", error);
        setSession(null);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [user, checkSessionValidity]);

  const refresh = async () => {
    try {
      setIsLoading(true);
      const newSession = await refreshSession();
      setSession(newSession);
      setIsValid(!!newSession);
    } catch (error) {
      console.error("Session refresh error:", error);
      setSession(null);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkValidity = async () => {
    const valid = await checkSessionValidity();
    setIsValid(valid);
    return valid;
  };

  return {
    session,
    isValid,
    isLoading: loading || isLoading,
    refresh,
    checkValidity,
  };
}
