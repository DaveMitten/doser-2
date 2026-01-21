"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { sessionService, Session } from "@/lib/sessionService";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { EnhancedSessionCard } from "@/components/sessions/enhanced-session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { NewSessionForm } from "@/components/new-session/new-session-form";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EffectsBreakdown } from "@/components/dashboard/effects-breakdown";
import { InfoBanner } from "@/components/dashboard/info-banner";
import { Carousel, CarouselItem } from "@/components/ui/carousel";

import {
  processDosingTrends,
  processEffectsData,
  processUsagePattern,
} from "@/lib/chartDataUtils";

interface DashboardStats {
  totalSessions: number;
  avgThcDose: number;
  avgCbdDose: number;
  totalDaysTracked: number;
  thisWeekSessions: number;
  lastWeekSessions: number;
  mostUsedDevice: string;
  totalThcConsumed: number;
  totalCbdConsumed: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);

  // DEBUG: Log user state on dashboard mount
  useEffect(() => {
    // console.log("=== DASHBOARD MOUNTED ===");
    // console.log("User:", user ? { id: user.id, email: user.email } : "No user");
  }, [user]);

  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.addBreadcrumb({
          category: 'dashboard',
          message: 'Dashboard useEffect',
          level: 'debug',
          data: {
            hasUser: !!user,
            userId: user?.id,
            email: user?.email,
          },
        });
      }).catch(() => {});
    }
    // #endregion
    
    if (!user) {
      // #region agent log
      if (typeof window !== 'undefined') {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.addBreadcrumb({
            category: 'dashboard',
            message: 'Dashboard: No user, returning early',
            level: 'warning',
            data: { hasUser: false },
          });
        }).catch(() => {});
      }
      // #endregion
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const supabase = createSupabaseBrowserClient();
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch user sessions
        const { data: sessions, error: sessionsError } =
          await sessionService.getUserSessions();

        if (sessionsError) {
          throw sessionsError;
        }

        if (sessions) {
          setAllSessions(sessions);
          setRecentSessions(sessions.slice(0, 3)); // Get 3 most recent sessions

          // Calculate statistics
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const twoWeeksAgo = new Date(
            now.getTime() - 14 * 24 * 60 * 60 * 1000
          );

          const thisWeekSessions = sessions.filter(
            (s) => new Date(s.session_date) >= oneWeekAgo
          );
          const lastWeekSessions = sessions.filter(
            (s) =>
              new Date(s.session_date) >= twoWeeksAgo &&
              new Date(s.session_date) < oneWeekAgo
          );

          // Calculate unique days tracked
          const uniqueDays = new Set(sessions.map((s) => s.session_date)).size;

          // Calculate averages
          const totalThc = sessions.reduce((sum, s) => sum + s.total_thc_mg, 0);
          const totalCbd = sessions.reduce((sum, s) => sum + s.total_cbd_mg, 0);
          const avgThc = sessions.length > 0 ? totalThc / sessions.length : 0;
          const avgCbd = sessions.length > 0 ? totalCbd / sessions.length : 0;

          // Find most used device
          const deviceCounts: { [key: string]: number } = {};
          sessions.forEach((s) => {
            deviceCounts[s.device_name] =
              (deviceCounts[s.device_name] || 0) + 1;
          });
          const mostUsedDevice =
            Object.entries(deviceCounts).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "None";

          setStats({
            totalSessions: sessions.length,
            avgThcDose: Math.round(avgThc * 10) / 10,
            avgCbdDose: Math.round(avgCbd * 10) / 10,
            totalDaysTracked: uniqueDays,
            thisWeekSessions: thisWeekSessions.length,
            lastWeekSessions: lastWeekSessions.length,
            mostUsedDevice,
            totalThcConsumed: Math.round(totalThc * 10) / 10,
            totalCbdConsumed: Math.round(totalCbd * 10) / 10,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSessionClick = (_session: Session) => {
    // For now, just log the session. In a real app, you might want to navigate to a detail view
    // console.log("Session clicked:", _session);
  };

  const handleNewSessionCreated = () => {
    // Refresh dashboard data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-doser-surface border border-doser-border rounded-lg p-6"
            >
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden -mx-6 px-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] bg-doser-surface border border-doser-border rounded-lg p-4"
              >
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-doser-text-muted mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-doser">
            {/* {profile
              ? `Welcome back, ${profile?.full_name?.split(" ")[0]}!`
              : "Welcome back!"} */}
            Welcome back!
          </h1>
        </div>
      </div>

      {/* Stats Grid - Desktop: 4 columns, Mobile: Swipeable carousel */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          value={stats?.totalSessions || 0}
          label="Total Sessions"
          sublabel={
            stats && stats.lastWeekSessions > 0
              ? `+${
                  stats.thisWeekSessions - stats.lastWeekSessions
                } from last week`
              : "Last 7 days"
          }
        />
        <StatsCard
          value={`${stats?.avgThcDose || 0}mg`}
          label="Avg THC Dose"
          sublabel={
            stats && stats.totalThcConsumed > 0
              ? `${stats.totalThcConsumed}mg total consumed`
              : "Average per session"
          }
        />
        <StatsCard
          value={`${stats?.avgCbdDose || 0}mg`}
          label="Avg CBD Dose"
          sublabel={
            stats && stats.totalCbdConsumed > 0
              ? `${stats.totalCbdConsumed}mg total consumed`
              : "Average per session"
          }
        />
        <StatsCard
          value={stats?.totalDaysTracked || 0}
          label="Days Tracked"
          sublabel={
            stats && stats.thisWeekSessions > 0
              ? `${stats.thisWeekSessions} this week`
              : "Keep it up! 🌿"
          }
        />
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden -mx-6 px-6">
        <Carousel>
          <CarouselItem className="w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] h-[190px]">
            <StatsCard
              value={stats?.totalSessions || 0}
              label="Total Sessions"
              sublabel={
                stats && stats.lastWeekSessions > 0
                  ? `+${
                      stats.thisWeekSessions - stats.lastWeekSessions
                    } from last week`
                  : "Last 7 days"
              }
            />
          </CarouselItem>
          <CarouselItem className="w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] h-[190px]">
            <StatsCard
              value={`${stats?.avgThcDose || 0}mg`}
              label="Avg THC Dose"
              sublabel={
                stats && stats.totalThcConsumed > 0
                  ? `${stats.totalThcConsumed}mg total consumed`
                  : "Average per session"
              }
            />
          </CarouselItem>
          <CarouselItem className="w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] h-[190px]">
            <StatsCard
              value={`${stats?.avgCbdDose || 0}mg`}
              label="Avg CBD Dose"
              sublabel={
                stats && stats.totalCbdConsumed > 0
                  ? `${stats.totalCbdConsumed}mg total consumed`
                  : "Average per session"
              }
            />
          </CarouselItem>
          <CarouselItem className="w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] h-[190px]">
            <StatsCard
              value={stats?.totalDaysTracked || 0}
              label="Days Tracked"
              sublabel={
                stats && stats.thisWeekSessions > 0
                  ? `${stats.thisWeekSessions} this week`
                  : "Keep it up! 🌿"
              }
            />
          </CarouselItem>
        </Carousel>
      </div>

      {/* Analytics Section */}
      {stats && stats.totalSessions > 0 && allSessions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Analytics & Insights
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardCharts
                dosingTrends={processDosingTrends(allSessions)}
                effects={processEffectsData(allSessions)}
                usagePattern={processUsagePattern(allSessions)}
              />
            </div>
            <div>
              <EffectsBreakdown />
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <InfoBanner />

      {/* Recent Sessions */}
      {recentSessions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Sessions
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recentSessions.map((session) => (
              <EnhancedSessionCard
                key={session.id}
                session={session}
                onClick={handleSessionClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Sessions
          </h2>
          <EmptyState
            title="No sessions recorded yet"
            description="Start tracking your cannabis consumption to see your dosing patterns and effects"
            buttonText="Record Your First Session"
            onButtonClick={() => setIsNewSessionOpen(true)}
            icon="📊"
          />
        </div>
      )}

      {/* New Session Form */}
      <NewSessionForm
        isOpen={isNewSessionOpen}
        setSessionFormOpen={setIsNewSessionOpen}
        onSessionCreated={handleNewSessionCreated}
      />
    </div>
  );
}
