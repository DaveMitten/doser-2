"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Session } from "@/lib/sessionService"
import {
  formatDate,
  formatTime,
  getTemperatureDisplay,
} from "@/lib/sessionCardUtils"

interface EnhancedSessionCardProps {
  session: Session
  onClick: (session: Session) => void
}

// Effect mapping with colors and icons
const effectConfig: Record<string, { color: string; icon: string; type: 'positive' | 'neutral' | 'negative' }> = {
  euphoric: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '😌', type: 'positive' },
  happy: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '😊', type: 'positive' },
  creative: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '🎨', type: 'positive' },
  energetic: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '⚡', type: 'positive' },
  hungry: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '😋', type: 'positive' },
  relaxed: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '😌', type: 'positive' },
  focused: { color: 'bg-doser-effect-positive/15 text-doser-effect-positive border-doser-effect-positive/30', icon: '🎯', type: 'positive' },
  sleepy: { color: 'bg-doser-effect-neutral/15 text-doser-effect-neutral border-doser-effect-neutral/30', icon: '😴', type: 'neutral' },
  anxious: { color: 'bg-doser-effect-negative/15 text-doser-effect-negative border-doser-effect-negative/30', icon: '😰', type: 'negative' },
  dizzy: { color: 'bg-doser-effect-negative/15 text-doser-effect-negative border-doser-effect-negative/30', icon: '😵', type: 'negative' },
  paranoid: { color: 'bg-doser-effect-negative/15 text-doser-effect-negative border-doser-effect-negative/30', icon: '😨', type: 'negative' },
}

export function EnhancedSessionCard({ session, onClick }: EnhancedSessionCardProps) {
  const effects = session.effects || []
  const rating = session.rating || 0

  return (
    <Card
      className="overflow-hidden border-doser-border bg-doser-surface transition-all duration-300 hover:border-doser-primary hover:-translate-y-1 hover:shadow-doser-md cursor-pointer p-0"
      onClick={() => onClick(session)}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-5 border-b border-doser-border">
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">
            {formatTime(session.session_time)}
          </div>
          <div className="text-xs text-doser-text-disabled font-medium">
            {formatDate(session.session_date)}
          </div>
        </div>
        <div className="flex gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          ))}
        </div>
      </div>

      {/* Dosage Section */}
      <div className="p-6 pb-5 border-b border-doser-border">
        <div className="text-[11px] uppercase tracking-wider text-doser-text-disabled font-semibold mb-3">
          Dosage Breakdown
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-[28px] font-bold text-doser-thc tracking-tight">
              {session.total_thc_mg.toFixed(1)}<span className="text-lg">mg</span>
            </div>
            <div className="text-xs text-doser-text-disabled font-medium">
              Total THC
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-[28px] font-bold text-doser-cbd tracking-tight">
              {session.total_cbd_mg.toFixed(1)}<span className="text-lg">mg</span>
            </div>
            <div className="text-xs text-doser-text-disabled font-medium">
              Total CBD
            </div>
          </div>
        </div>
      </div>

      {/* Effects Section */}
      {effects && effects.length > 0 && (
        <div className="p-6 pb-5 border-b border-doser-border">
          <div className="text-[11px] uppercase tracking-wider text-doser-text-disabled font-semibold mb-3">
            Effects Experienced
          </div>
          <div className="flex flex-wrap gap-2">
            {effects.slice(0, 6).map((effect) => {
              const config = effectConfig[effect.toLowerCase()] || effectConfig.euphoric
              return (
                <div
                  key={effect}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
                    ${config.color}
                  `}
                >
                  <span className="text-sm">{config.icon}</span>
                  <span className="capitalize">{effect}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Device Section */}
      <div className="p-6 pt-5">
        <div className="text-[11px] uppercase tracking-wider text-doser-text-disabled font-semibold mb-4">
          Device & Method
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-doser-primary to-doser-primary-hover text-xl">
            💨
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {session.device_name}
            </div>
            <div className="text-xs text-doser-text-disabled">
              {getTemperatureDisplay(session)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-[11px] text-doser-text-disabled">Duration</span>
            <span className="text-xs font-semibold">{session.duration_minutes}min</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-[11px] text-doser-text-disabled">Method</span>
            <span className="text-xs font-semibold">
              {session.unit_type === "capsule" ? "Capsule" : "Chamber"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}