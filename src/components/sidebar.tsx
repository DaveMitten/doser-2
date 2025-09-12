"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { signOut as serverSignOut } from "@/app/(public)/auth/actions";
import { LogOut } from "lucide-react";

interface SidebarProps {
  currentPage?: string;
  onMobileItemClick?: () => void;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: string;
  pageKey: string;
}

interface SettingsItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  pageKey: string;
}

export function Sidebar({ currentPage, onMobileItemClick }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigation configuration
  const navigationItems: NavigationItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      pageKey: "dashboard",
    },
    {
      href: "/calculator",
      label: "Calculator",
      icon: "🧮",
      pageKey: "calculator",
    },
    {
      href: "/sessions",
      label: "Sessions",
      icon: "📈",
      pageKey: "sessions",
    },
  ];

  // Settings configuration
  const settingsItems: SettingsItem[] = [
    {
      href: "/upgrade",
      label: "Upgrade",
      icon: "💳",
      pageKey: "upgrade",
    },
    {
      href: "/preferences",
      label: "Preferences",
      icon: "⚙️",
      pageKey: "preferences",
    },
    // {
    //   href: "/profile",
    //   label: "Profile",
    //   icon: "👥",
    //   pageKey: "profile",
    // },
  ];

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

  // Helper function to render navigation items
  const renderNavigationItem = (item: NavigationItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
        currentPage === item.pageKey
          ? "text-doser-primary bg-doser-primary-light"
          : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
      }`}
      onClick={onMobileItemClick}
    >
      <span className="text-base">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );

  // Helper function to render settings items
  const renderSettingsItem = (item: SettingsItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
        currentPage === item.pageKey
          ? "text-doser-primary bg-doser-primary-light"
          : "text-doser-text-muted hover:bg-doser-surface-hover hover:text-doser-text"
      }`}
      onClick={onMobileItemClick}
    >
      <span className="text-base">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );

  return (
    <aside className="w-full min-h-screen p-4 flex flex-col">
      <div className="space-y-6 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center space-x-3 pb-6 border-b border-doser-border">
          <div className="w-7 h-7 bg-gradient-to-br from-doser-primary to-doser-primary-hover rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🌿</span>
          </div>
          <span className="text-lg font-bold text-doser-text">Doser</span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navigationItems.map(renderNavigationItem)}
        </nav>

        {/* Settings Section */}
        <div className="pt-6 border-t border-doser-border">
          <div className="text-doser-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Settings
          </div>
          <nav className="space-y-2">
            {settingsItems.map(renderSettingsItem)}
            <Link
              key="logout"
              href="#"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm`}
              onClick={handleSignOut}
            >
              <span className="text-base">{<LogOut />}</span>
              <span>Logout</span>
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
          <Link href="/upgrade">
            <Button variant="dashboard" size="sm" className="w-full text-xs">
              Upgrade now
            </Button>
          </Link>
        </div>
      </div>
      {/* User Profile - Bottom */}
      {/* <div className="space-y-3 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-doser-surface-hover rounded-lg">
          <div className="w-4 h-4 bg-gradient-to-br from-doser-accent to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="">
            <div className="text-doser-text text-sm font-semibold"> */}
      {/* {user?.email?.split("@")[0] || "User"} */}
      {/* Luke
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
        </div> */}
      {/* </div> */}
    </aside>
  );
}
