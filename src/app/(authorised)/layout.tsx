"use client";

import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentPage } from "@/lib/utils";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AuthorisedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = getCurrentPage(pathname);

  return (
    <ProtectedRoute>
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-doser-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentPage={currentPage} />
        </div>

        {/* Mobile Sidebar Button */}
        <div className="md:hidden fixed top-4 right-4 z-20">
          <Sheet
            open={isMobileSidebarOpen}
            onOpenChange={setIsMobileSidebarOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-doser-text-muted hover:text-doser-text bg-doser-surface border border-doser-border"
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
              side="left"
              className="bg-doser-surface border-doser-border w-80 p-0"
            >
              <Sidebar
                currentPage={currentPage}
                onMobileItemClick={() => setIsMobileSidebarOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
