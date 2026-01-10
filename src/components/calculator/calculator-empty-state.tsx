import { Card } from "@/components/ui/card"

export function CalculatorEmptyState() {
  const steps = [
    "Select your vaporizer device from the dropdown",
    "Choose your measurement method (Capsule or Chamber)",
    "Enter THC and CBD percentages from your product",
    "Set your desired dose amount and type",
  ]

  return (
    <Card className="bg-doser-surface border-doser-border p-8">
      <h2 className="text-xl font-semibold mb-7">Calculation Details</h2>

      <div className="flex flex-col items-center justify-center py-16 px-10 border-2 border-dashed border-doser-border rounded-xl min-h-[400px]">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-doser-primary/20 to-doser-primary/10 text-4xl mb-6">
          🧮
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2">
          Ready to Calculate
        </h3>

        {/* Description */}
        <p className="text-sm text-doser-text-disabled text-center max-w-sm mb-8 leading-relaxed">
          Fill in the calculator settings on the left to get your personalized dosage recommendation
        </p>

        {/* Steps */}
        <div className="w-full max-w-md space-y-0">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-3 py-3 border-t border-doser-border first:border-t last:border-b"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-doser-primary/20 text-xs font-bold text-doser-primary">
                {index + 1}
              </div>
              <p className="text-xs text-doser-text-muted leading-relaxed pt-0.5">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="mt-7">
        <h3 className="text-base font-semibold mb-4">Safety Guidelines</h3>
        <div className="space-y-3">
          {[
            "Start with half the recommended dose",
            "Wait 15-30 minutes before consuming more",
            "Consume in a safe, comfortable environment",
          ].map((guideline, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-lg bg-doser-primary/5 border border-doser-primary/10"
            >
              <div className="text-doser-primary text-base flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-doser-text-secondary leading-relaxed">
                {guideline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}