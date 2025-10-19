"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { UserSubscription } from "@/lib/dodo-types";

interface UserDataContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

const STORAGE_KEY = "doser_subscription_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to load from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Use cache if it's less than CACHE_DURATION old
        if (now - timestamp < CACHE_DURATION) {
          setSubscription(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error loading subscription from cache:", err);
    }
  }, []);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/subscriptions/status");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subscription");
      }

      setSubscription(data.subscription);

      // Cache the result
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              data: data.subscription,
              timestamp: Date.now(),
            })
          );
        } catch (err) {
          console.error("Error caching subscription:", err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching subscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    // Clear cache before refetching
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    await fetchSubscription();
  };

  // Fetch subscription when user is authenticated
  useEffect(() => {
    if (authLoading) return;

    if (user && !subscription) {
      // Only fetch if we don't have cached data and user is authenticated
      fetchSubscription();
    } else if (!user) {
      setSubscription(null);
      setIsLoading(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const value: UserDataContextType = {
    subscription,
    isLoading,
    error,
    refetch,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
