"use client";

import React, { useState, useEffect } from "react";
import { LogLevel, StatsigProvider } from "@statsig/react-bindings";
import { useAuth } from "@/context/AuthContext";

export default function MyStatsig({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [statsigError, setStatsigError] = useState(false);

  // Use authenticated user ID if available, otherwise use anonymous identifier
  const userID = user?.id || "anonymous";

  const statsigUser = {
    userID: userID,
    // Optional additional fields from authenticated user:
    ...(user?.email && { email: user.email }),
    // Custom IDs and metadata can be added here if needed
    // customIDs: { internalID: user.id },
    // custom: { plan: 'premium' }
  };

  // Set up error handling for network failures
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("Failed to fetch") &&
        event.reason?.message?.includes("prodregistryv2.org")
      ) {
        console.warn(
          "Statsig network request failed, continuing without analytics:",
          event.reason
        );
        setStatsigError(true);
        event.preventDefault(); // Prevent the error from being logged to console
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () =>
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
  }, []);

  // If Statsig fails to initialize, render children without analytics
  if (statsigError) {
    return <>{children}</>;
  }

  try {
    return (
      <StatsigProvider
        sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
        user={statsigUser}
        options={{
          logLevel: LogLevel.Debug,
        }}
      >
        {children}
      </StatsigProvider>
    );
  } catch (error) {
    console.warn("Statsig initialization failed:", error);
    setStatsigError(true);
    return <>{children}</>;
  }
}
