"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "../lib/utils";
import DoserSVG from "./svgs/DoserSVG";
import { useAuth } from "@/context/AuthContext";

interface CTAButton {
  href: string;
  label: string;
  variant: "ghost" | "default";
  className?: string;
}

const getCtaButtons = (isAuthenticated: boolean): CTAButton[] => {
  if (isAuthenticated) {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        variant: "default",
        className:
          "bg-doser-primary hover:bg-doser-primary-hover text-doser-text font-bold",
      },
    ];
  }

  return [
    {
      href: "/auth",
      label: "Sign In",
      variant: "ghost",
      className: "text-doser-text-muted ",
    },
    {
      href: "/auth?signup=true",
      label: "Start Tracking Free",
      variant: "default",
      className:
        "bg-doser-primary hover:bg-doser-primary-hover text-doser-text font-bold",
    },
  ];
};

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const renderCTAButton = (button: CTAButton, isMobile = false) => {
    const mobileClasses = isMobile
      ? cn(
        "w-full justify-center ",
        button.variant === "ghost"
          ? "hover:!bg-transparent hover:!text-doser-text"
          : ""
      )
      : "";
    const buttonClasses = `${button.className} ${mobileClasses}`;

    return (
      <Link
        key={button.label + `${isMobile}`}
        href={button.href}
        className="w-full "
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <Button variant={button.variant} className={buttonClasses}>
          {button.label}
        </Button>
      </Link>
    );
  };

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-2 lg:px-8">
      {/* Logo - Far Left */}
      <Link href="/" className="hidden md:flex relative w-20 h-20 shrink-0">
        <DoserSVG />
      </Link>

      {/* Desktop CTA Buttons - Far Right */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        {loading ? (
          <div className="text-doser-text-muted text-sm">Loading...</div>
        ) : (
          getCtaButtons(!!user).map((button) => renderCTAButton(button))
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-doser-text-muted hover:text-doser-text"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-doser-surface border-doser-border w-80"
          >
            <div className="space-y-6">
              {/* Mobile CTA Buttons */}
              <div className="space-y-2">
                {loading ? (
                  <div className="text-doser-text-muted text-sm text-center py-2">Loading...</div>
                ) : (
                  getCtaButtons(!!user).map((button) =>
                    renderCTAButton(button, true)
                  )
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
