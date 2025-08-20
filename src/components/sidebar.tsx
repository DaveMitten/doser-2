"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { signOut as serverSignOut } from "@/app/auth/actions";

interface SidebarProps {
  currentPage?: string;
  onMobileItemClick?: () => void;
}

export function Sidebar({ currentPage, onMobileItemClick }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // Try client-side signout first
      await signOut();
    } catch (error) {
      console.error("1: Error signing out:", error);
      // Fallback to server action
      try {
        await serverSignOut();
      } catch (serverError) {
        console.error("2: Error server error signing out:", serverError);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 h-full bg-doser-surface border-r border-doser-border p-4">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 pb-6 border-b border-doser-border">
          <div className="w-7 h-7 bg-gradient-to-br from-doser-primary to-doser-primary-hover rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🌿</span>
          </div>
          <span className="text-lg font-bold text-doser-text">Doser</span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <Link
            href="/authorised/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "dashboard"
                ? "text-doser-primary bg-doser-primary-light"
                : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
            }`}
            onClick={onMobileItemClick}
          >
            <span className="text-base">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/authorised/calculator"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "calculator"
                ? "text-doser-primary bg-doser-primary-light"
                : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
            }`}
            onClick={onMobileItemClick}
          >
            <span className="text-base">🧮</span>
            <span>Calculator</span>
          </Link>
          <Link
            href="/authorised/sessions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "sessions"
                ? "text-doser-primary bg-doser-primary-light"
                : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
            }`}
            onClick={onMobileItemClick}
          >
            <span className="text-base">📈</span>
            <span>Sessions</span>
          </Link>
          <Link
            href="/authorised/calendar"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "calendar"
                ? "text-doser-primary bg-doser-primary-light"
                : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
            }`}
            onClick={onMobileItemClick}
          >
            <span className="text-base">📅</span>
            <span>Calendar</span>
          </Link>
          <Link
            href="/authorised/history"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
              currentPage === "history"
                ? "text-doser-primary bg-doser-primary-light"
                : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
            }`}
            onClick={onMobileItemClick}
          >
            <span className="text-base">📋</span>
            <span>History</span>
          </Link>
        </nav>

        {/* Settings Section */}
        <div className="pt-6 border-t border-doser-border">
          <div className="text-doser-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Settings
          </div>
          <nav className="space-y-2">
            <Link
              href="/authorised/preferences"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                currentPage === "preferences"
                  ? "text-doser-primary bg-doser-primary-light"
                  : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
              }`}
              onClick={onMobileItemClick}
            >
              <span className="text-base">⚙️</span>
              <span>Preferences</span>
            </Link>
            <Link
              href="/authorised/profile"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                currentPage === "profile"
                  ? "text-doser-primary bg-doser-primary-light"
                  : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
              }`}
              onClick={onMobileItemClick}
            >
              <span className="text-base">👥</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        {/* Credits Widget */}
        <div className="bg-doser-primary-light border border-doser-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-doser-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💎</span>
            </div>
            <div className="text-doser-primary text-xl font-bold">25</div>
          </div>
          <div className="text-doser-text-muted text-xs mb-2">
            Calculations available
          </div>
          <div className="text-doser-text-muted text-xs mb-3">
            Need more? Upgrade your plan
          </div>
          <Button variant="dashboard" size="sm" className="w-full text-xs">
            Upgrade now
          </Button>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-doser-surface-hover rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-doser-accent to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-doser-text text-sm font-semibold">
                {user?.email?.split("@")[0] || "User"}
              </div>
              <div className="text-doser-text-muted text-xs">Free Plan</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="text-doser-text-muted hover:text-doser-text p-1"
            >
              {isLoggingOut ? "..." : "🚪"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
