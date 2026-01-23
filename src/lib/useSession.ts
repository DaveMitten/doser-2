import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Session } from "@supabase/supabase-js";

export interface UseSessionReturn {
  session: Session | null;
  isValid: boolean;
  isLoading: boolean;

}

/**
 * Custom hook for managing authentication session state
 * Provides session validation, refresh capabilities, and loading states
 */
export function useSession(): UseSessionReturn {
  const { user, loading, } = useAuth();
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

    };

    validateSession();
  }, [user]);

  return {
    session,
    isValid,
    isLoading: loading || isLoading,
  };
}
