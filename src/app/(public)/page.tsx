"use client";

import { FeaturesSection } from "@/components/features-section";
import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Top-level console log to verify file loads
console.log("HOME PAGE FILE LOADED");

export default function Home() {
  console.log("HOME COMPONENT RENDERED");
  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    console.log('[Home] Render state:', {
      hasUser: !!user,
      loading,
      userId: user?.id,
      email: user?.email,
    });
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user) {
      console.log('[Home] Redirecting authenticated user to dashboard');
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <>
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div className="bg-doser-background relative overflow-hidden min-h-screen">
          {/* Green Aura Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-doser-primary/5 via-doser-primary/3 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-doser-primary/8 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-6 min-h-screen flex items-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left Column - Content */}
              <div className="space-y-8">
                {/* Main Headline */}
                <h1 className="text-4xl lg:text-6xl font-bold text-doser-text leading-tight">
                  <span className="text-doser-primary">Dosing </span> is hard,
                  we make it easy.
                </h1>

                {/* Description */}
                <p className="text-xl text-doser-text-muted leading-relaxed">
                  Take control of your cannabis prescription and learn how to
                  get the most out of your cannabis.
                </p>
                <div className="mt-16">
                  <CTAButton />
                </div>
              </div>

              {/* Right Column - Dashboard Screenshot */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Dashboard Screenshot */}
                  <div className="w-full max-w-2xl">
                    <Image
                      src="/dashboard-macbook-screenshot.svg"
                      alt="Doser Dashboard - Cannabis Dosing App"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <FeaturesSection />
      </main>
    </>
  );
}
