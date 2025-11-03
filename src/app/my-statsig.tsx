"use client";

import React from "react";
import { LogLevel, StatsigProvider } from "@statsig/react-bindings";
import { useAuth } from "@/context/AuthContext";

export default function MyStatsig({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

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

  return (
    <StatsigProvider
      sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
      user={statsigUser}
      options={{ logLevel: LogLevel.Debug }}
    >
      {children}
    </StatsigProvider>
  );
}
