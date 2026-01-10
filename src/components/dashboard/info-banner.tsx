import { Lightbulb } from "lucide-react"

export function InfoBanner() {
  return (
    <div className="rounded-xl border border-doser-green/30 bg-gradient-to-br from-doser-green/10 to-doser-green-light/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-doser-green flex-shrink-0">
          <Lightbulb className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="text-sm text-doser-text-secondary leading-relaxed">
          <span className="font-semibold">Tip:</span> Your dosing patterns show 
          increased usage on weekends. Consider tracking how different strains affect 
          your energy levels to optimize your sessions.
        </div>
      </div>
    </div>
  )
}