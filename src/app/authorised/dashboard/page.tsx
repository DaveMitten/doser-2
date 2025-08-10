import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-doser-text mb-2">
            Welcome back, Alex
          </h1>
          <p className="text-doser-text-muted">
            Here&apos;s your cannabis dosing overview for today
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">12</div>
              <div className="text-doser-text-muted text-sm mb-2">
                Total Sessions
              </div>
              <div className="text-doser-primary text-sm">
                +2 from last week
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg THC Dose */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">
                2.5mg
              </div>
              <div className="text-doser-text-muted text-sm mb-2">
                Avg THC Dose
              </div>
              <div className="text-red-400 text-sm">-0.3mg from last week</div>
            </div>
          </CardContent>
        </Card>

        {/* Tolerance Match */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-primary mb-2">
                85%
              </div>
              <div className="text-doser-text-muted text-sm mb-2">
                Tolerance Match
              </div>
              <div className="text-doser-primary text-sm">Stable</div>
            </div>
          </CardContent>
        </Card>

        {/* Days Tracked */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">7</div>
              <div className="text-doser-text-muted text-sm mb-2">
                Days Tracked
              </div>
              <div className="text-doser-primary text-sm">This week</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Calculator */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-doser-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-doser-text font-bold mb-2">
                  Quick Calculator
                </h3>
                <p className="text-doser-text-muted text-sm mb-4">
                  Calculate your perfect dose in seconds with our smart
                  algorithm
                </p>
                <Link href="/authorised/calculator">
                  <Button variant="doser" className="w-full">
                    Start Calculation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Analytics */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-doser-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-doser-text font-bold mb-2">
                  Session Analytics
                </h3>
                <p className="text-doser-text-muted text-sm mb-4">
                  View detailed insights about your consumption patterns
                </p>
                <Button variant="doser" className="w-full">
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tolerance Tracking */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 12a2 2 0 114 0 2 2 0 01-4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-doser-text font-bold mb-2">
                  Tolerance Tracking
                </h3>
                <p className="text-doser-text-muted text-sm mb-4">
                  Monitor your tolerance levels and get personalized
                  recommendations
                </p>
                <Button variant="doser" className="w-full">
                  Check Tolerance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile App */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-doser-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 011 1v1h4V3a1 1 0 112 0v1h2a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h2V3a1 1 0 011-1zM9 4H5v11h10V4H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-doser-text font-bold mb-2">Mobile App</h3>
                <p className="text-doser-text-muted text-sm mb-4">
                  Download our mobile app for calculations on the go
                </p>
                <Button variant="doser" className="w-full">
                  Download App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
