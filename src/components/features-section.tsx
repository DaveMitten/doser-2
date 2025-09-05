import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: (
      <svg
        className="w-8 h-8 text-doser-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Precision Dosing Calculator",
    description: "Get accurate THC/CBD dosing for your vaporizer.",
    benefits: [
      "Dose by capsule or chamber.",
      "Choose from a vaporiser list",
      "Set the desired THC/CBD dose for your session",
    ],
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-doser-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    title: "Comprehensive Session Tracking",
    description:
      "Log your cannabis sessions with detailed notes, effects, and outcomes for better insights.",
    benefits: [
      "Detailed session logging",
      "Effect tracking",
      "Consumption method",
      "THC/CBD consumed",
      "Total chambers/capsules used",
      "Temperature recording",
      "Duration of session",
      "Session rating",
      "Session notes",
      "Dosage breakdown",
    ],
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-doser-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "Data-Driven Analytics",
    description:
      "Understand your patterns and optimize your cannabis experience with personalized insights and trends.",
    benefits: [
      "Session pattern recognition",
      "Trend analysis",
      "Average THC/CBD consumption",

      "Personalized recommendations",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24 bg-doser-surface">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-doser-text mb-4">
            Everything you need to optimize your cannabis experience
          </h2>
          <p className="text-xl text-doser-text-muted max-w-3xl mx-auto">
            Our comprehensive platform combines precision dosing, detailed
            tracking, and intelligent analytics to help you find your perfect
            cannabis routine.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-doser-surface border-doser-border hover:bg-doser-surface-hover transition-colors duration-200 group"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-doser-primary-light rounded-full w-fit group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <CardTitle className="text-doser-text text-xl mb-2">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-doser-text-muted text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-center text-sm text-doser-text-muted"
                    >
                      <svg
                        className="w-4 h-4 text-doser-primary mr-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-doser-text-muted text-lg mb-6">
            Ready to take control of your cannabis journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Placeholder for future CTA buttons */}
            <div className="px-8 py-3 bg-doser-primary text-doser-text font-semibold rounded-lg opacity-50 cursor-not-allowed">
              Get Started (Coming Soon)
            </div>
            <div className="px-8 py-3 border border-doser-border text-doser-text font-semibold rounded-lg opacity-50 cursor-not-allowed">
              Learn More
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
