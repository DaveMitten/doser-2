"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-doser-primary rounded flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-doser-text">Doser</span>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-8">
        <Link
          href="/"
          className={`transition-colors ${
            currentPage === "home"
              ? "text-doser-text"
              : "text-doser-text-muted hover:text-doser-text"
          }`}
        >
          Home
        </Link>
        <a
          href="#features"
          className="text-doser-text-muted hover:text-doser-text transition-colors"
        >
          Features
        </a>
        <Link
          href="/pricing"
          className={`transition-colors ${
            currentPage === "pricing"
              ? "text-doser-text"
              : "text-doser-text-muted hover:text-doser-text"
          }`}
        >
          Pricing
        </Link>
      </div>

      {/* Desktop CTA Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/auth">
          <Button
            variant="ghost"
            className="text-doser-text-muted hover:text-doser-text"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/auth">
          <Button className="bg-doser-primary hover:bg-doser-primary-hover text-doser-text">
            Get Started
          </Button>
        </Link>
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
              <div className="space-y-4">
                <Link
                  href="/"
                  className={`block py-3 px-4 rounded-lg transition-colors ${
                    currentPage === "home"
                      ? "text-doser-text bg-doser-surface-hover"
                      : "text-doser-text-muted hover:text-doser-text hover:bg-doser-surface-hover"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="block py-3 px-4 rounded-lg text-doser-text-muted hover:text-doser-text hover:bg-doser-surface-hover transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <Link
                  href="/pricing"
                  className={`block py-3 px-4 rounded-lg transition-colors ${
                    currentPage === "pricing"
                      ? "text-doser-text bg-doser-surface-hover"
                      : "text-doser-text-muted hover:text-doser-text hover:bg-doser-surface-hover"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="space-y-3 pt-6 border-t border-doser-border">
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full text-doser-text-muted hover:text-doser-text justify-start"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
