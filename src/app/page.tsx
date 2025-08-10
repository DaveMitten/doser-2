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
              {/* AI Badge */}
              <div className="inline-flex items-center space-x-2 bg-doser-primary-light text-green-400 px-3 py-1 rounded-full text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Powered by AI</span>
              </div>

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

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-doser-text-muted">
                  <svg
                    className="w-5 h-5 text-doser-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Early access</span>
                </div>
                <div className="flex items-center space-x-2 text-doser-text-muted">
                  <svg
                    className="w-5 h-5 text-doser-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center space-x-2 text-doser-text-muted">
                  <svg
                    className="w-5 h-5 text-doser-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free forever</span>
                </div>
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
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Side - Circular Buttons */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-doser-primary rounded-full flex items-center justify-center text-doser-text font-bold">
                A
              </div>
              <div className="w-10 h-10 bg-doser-primary rounded-full flex items-center justify-center text-doser-text font-bold">
                M
              </div>
              <div className="w-10 h-10 bg-doser-primary rounded-full flex items-center justify-center text-doser-text font-bold">
                S
              </div>
              <div className="w-10 h-10 bg-doser-primary rounded-full flex items-center justify-center text-doser-text font-bold">
                L
              </div>
              <div className="w-10 h-10 bg-doser-primary rounded-full flex items-center justify-center text-doser-text font-bold">
                J
              </div>
              <div className="w-10 h-10 bg-doser-primary rounded-full flex items-center justify-center text-doser-text font-bold">
                +
              </div>
            </div>

            {/* Right Side - Trust Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-doser-text-muted text-sm">
                  Trusted by 1,200+ beta users
                </span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-doser-text-muted text-sm">
              © 2025 Doser. For educational purposes only. Please consume
              responsibly and in accordance with local laws.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
