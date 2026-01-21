"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import DoserSVG from "./svgs/DoserSVG";
import { useAuth } from "@/context/AuthContext";
import * as Sentry from "@sentry/nextjs";

interface NavigationProps {
  currentPage?: string;
}

interface NavigationLink {
  href: string;
  label: string;
  pageKey: string;
}

const navigationLinks: NavigationLink[] = [
  { href: "/", label: "Home", pageKey: "home" },
  { href: "/pricing", label: "Pricing", pageKey: "pricing" },
];

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
      label: "Get Started",
      variant: "default",
      className:
        "bg-doser-primary hover:bg-doser-primary-hover text-doser-text font-bold",
    },
  ];
};

export function Navigation({ currentPage }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // #region agent log
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Navigation render',
      level: 'debug',
      data: {
        hasUser: !!user,
        loading,
        userId: user?.id,
        email: user?.email,
        pathname,
        hypothesisId: 'C',
      },
    });
  }, [user, loading, pathname]);
  // #endregion

  // Auto-determine current page if not provided
  if (!currentPage) {
    if (pathname === "/pricing") {
      currentPage = "pricing";
    } else {
      currentPage = "home";
    }
  }

  // #region agent log
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Rendering CTA buttons',
      level: 'debug',
      data: {
        loading,
        hasUser: !!user,
        buttonsCount: !loading ? getCtaButtons(!!user).length : 0,
        hypothesisId: 'C',
      },
    });
  }, [loading, user]);
  // #endregion

  const renderNavigationLink = (link: NavigationLink, isMobile = false) => {
    const isActive = currentPage === link.pageKey;
    const baseClasses = isMobile
      ? "block py-3 px-4 rounded-lg transition-colors"
      : "transition-colors";

    const activeClasses = isActive
      ? "text-doser-text"
      : "text-doser-text-muted hover:text-doser-text";

    return (
      <Link
        key={link.label + `${isMobile}`}
        href={link.href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {link.label}
      </Link>
    );
  };

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
    <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <DoserSVG width={75} height={75} />
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-8">
        {navigationLinks.map((link) => renderNavigationLink(link))}
      </div>

      {/* Desktop CTA Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        {!loading &&
          getCtaButtons(!!user).map((button) => renderCTAButton(button))}
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
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navigationLinks.map((link) =>
                  renderNavigationLink(link, true)
                )}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="pt-6 border-t border-doser-border space-y-2">
                {!loading &&
                  getCtaButtons(!!user).map((button) =>
                    renderCTAButton(button, true)
                  )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
