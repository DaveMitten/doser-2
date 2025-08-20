import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-doser-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </div>

      {/* Navigation */}
      <Navigation currentPage="home" />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Main Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold text-doser-text leading-tight">
                The <span className="text-doser-primary">smartest</span>{" "}
                cannabis calculator you&apos;ve been waiting for.
              </h1>

              {/* Description */}
              <p className="text-xl text-doser-text-muted leading-relaxed">
                Take control of your cannabis experience with precision dosing,
                personalized recommendations, and comprehensive tracking—all in
                one intelligent platform.
              </p>

              {/* Email Input */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-doser-surface border-doser-border text-doser-text placeholder-gray-400 focus:ring-doser-primary"
                />
                <Button className="bg-doser-primary hover:bg-doser-primary-hover text-doser-text">
                  Join Waitlist
                </Button>
              </div>
            </div>

            {/* Right Column - Mobile App Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-64 h-96 bg-doser-surface rounded-3xl border-4 border-doser-border p-4 transform rotate-6">
                  {/* App Header */}
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-6 h-6 bg-doser-primary rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-doser-text font-bold">Doser</div>
                      <div className="text-xs text-gray-400">
                        Your personalized cannabis companion
                      </div>
                    </div>
                  </div>

                  {/* App Cards */}
                  <div className="space-y-4">
                    <Card className="bg-doser-primary border-0">
                      <CardContent className="p-4">
                        <div className="text-doser-text text-sm">
                          Recommended dose
                        </div>
                        <div className="text-doser-text text-2xl font-bold">
                          2.5mg
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-doser-accent border-0">
                      <CardContent className="p-4">
                        <div className="text-doser-text text-sm">
                          Tolerance match
                        </div>
                        <div className="text-doser-text text-2xl font-bold">
                          85%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-doser-border mt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-doser-text-muted text-sm">© 2025 Doser.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
