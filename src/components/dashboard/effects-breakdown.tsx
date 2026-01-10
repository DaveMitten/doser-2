import { Card } from "@/components/ui/card"

const effects = [
  { name: 'Euphoric', percentage: 22, color: 'bg-doser-primary' },
  { name: 'Hungry', percentage: 11, color: 'bg-doser-effect-happy' },
  { name: 'Energetic', percentage: 11, color: 'bg-doser-effect-energetic' },
  { name: 'Happy', percentage: 22, color: 'bg-doser-effect-happy' },
  { name: 'Creative', percentage: 11, color: 'bg-doser-effect-creative' },
  { name: 'Anxious', percentage: 11, color: 'bg-doser-effect-negative' },
  { name: 'Dizzy', percentage: 11, color: 'bg-doser-effect-dizzy' },
]

export function EffectsBreakdown() {
  return (
    <Card className="bg-doser-surface border-doser-border p-8">
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Effects Experienced</h3>
        <p className="text-xs text-doser-text-disabled">Distribution breakdown</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {effects.map((effect) => (
          <div
            key={effect.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className={`w-3 h-3 rounded-full ${effect.color} flex-shrink-0`} />
            <div className="flex-1 text-sm text-doser-text-muted">
              {effect.name}
            </div>
            <div className="text-sm font-semibold text-doser-text-primary">
              {effect.percentage}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}