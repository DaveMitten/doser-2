"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface CTAButtonProps {
  variant?: "hero" | "features";
}

export function CTAButton({ variant = "hero" }: CTAButtonProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const isHero = variant === "hero";
  const linkHref = user ? "/dashboard" : "/auth?signup=true";
  const buttonText = user ? "Dashboard" : "Start Tracking Free";

  return (
    <Link key={buttonText} href={linkHref} className={isHero ? "mt-16" : ""}>
      <Button
        variant="default"
        className="bg-doser-primary hover:bg-doser-primary-hover text-doser-text font-bold"
        size="xl"
      >
        {buttonText}
      </Button>
    </Link>
  );
}
