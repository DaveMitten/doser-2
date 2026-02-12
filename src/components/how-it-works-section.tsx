export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Log your Session",
      description:
        "Before or right after using, log the details of your session in seconds using our quick-entry interface. Works on desktop and mobile.",
      tags: ["Strain", "Method", "Dose amount", "Vape / Oil / Flower", "Time of day"],
    },
    {
      number: "02",
      title: "Track your Effects",
      description:
        "Update your session later with how you actually feel. Rate your symptom relief, note any side effects, and track psychoactivity level.",
      tags: ["Symptom relief", "Side effects", "Psychoactivity", "Mood", "Sleep quality"],
    },
    {
      number: "03",
      title: "Get Insights",
      description:
        "Your data builds over time into a clear picture of what works for you. See which strains, doses, and methods consistently give you the best relief.",
      tags: ["Usage trends", "Optimal dose range", "Best strains for you", "Tolerance tracking"],
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-doser-background border-t border-doser-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Large background number */}
              <div className="text-6xl lg:text-7xl font-bold text-doser-text/5 absolute -top-8 -left-2 select-none">
                {step.number}
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-4">
                {/* Circle badge with number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-doser-primary/30 bg-doser-primary/10">
                  <span className="text-lg font-bold text-doser-primary">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold text-doser-text">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-doser-text-muted leading-relaxed">
                  {step.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {step.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-doser-surface border border-doser-border text-doser-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
