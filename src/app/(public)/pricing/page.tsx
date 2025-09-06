"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PricingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to authenticated pricing page
        router.push("/plans");
      } else {
        // User is not authenticated, redirect to signup page
        router.push("/signup");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-doser-background flex items-center justify-center">
        <div className="text-doser-text">Loading...</div>
      </div>
    );
  }

  return null; // Will redirect
}
