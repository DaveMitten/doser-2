import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingPage() {
  return (
    <>
      {/* Main Content */}
      <main className="relative z-10 ">
        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-doser-text-muted mb-8">
              Start with our free plan and upgrade as you grow
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className="text-doser-text">Monthly</span>
              <Switch className="data-[state=checked]:bg-doser-primary" />
              <span className="text-doser-text">Yearly</span>
              <Badge variant="secondary" className="bg-orange-500 text-white">
                Save 30%
              </Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-doser-surface border-doser-border">
              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold text-doser-text">Starter</h3>
                <p className="text-doser-text-muted">
                  Perfect for occasional users
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-doser-primary">
                    $0
                  </span>
                  <span className="text-doser-text-muted">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Basic dosage calculator
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      5 calculations per day
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Basic vaporizer profiles
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">Safety guidelines</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-doser-text-muted">
                      Session tracking
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-doser-text-muted">
                      Tolerance monitoring
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-doser-text-muted">
                      Advanced analytics
                    </span>
                  </div>
                </div>
                <Button className="w-full bg-doser-surface hover:bg-doser-surface-hover text-doser-text border border-doser-border">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-doser-surface border-2 border-doser-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-doser-primary text-doser-text">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold text-doser-text">Pro</h3>
                <p className="text-doser-text-muted">
                  For regular users and enthusiasts
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-doser-primary">
                    $9.99
                  </span>
                  <span className="text-doser-text-muted">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Everything in Starter
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Unlimited calculations
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Session tracking & history
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Tolerance monitoring
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Custom vaporizer profiles
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">Weekly insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Basic AI recommendations
                    </span>
                  </div>
                </div>
                <Button className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text">
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* Expert Plan */}
            <Card className="bg-doser-surface border-doser-border">
              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold text-doser-text">Expert</h3>
                <p className="text-doser-text-muted">
                  For medical users and professionals
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-doser-primary">
                    $19.99
                  </span>
                  <span className="text-doser-text-muted">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">Everything in Pro</span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Advanced AI recommendations
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Medical condition profiles
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Detailed analytics & reports
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">
                      Export data (PDF/CSV)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <span className="text-doser-text">Batch calculations</span>
                  </div>
                </div>
                <Button className="w-full bg-doser-surface hover:bg-doser-surface-hover text-doser-text border border-doser-border">
                  Start Expert Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-doser-text-muted">
              Everything you need to know about Doser pricing and features
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem
                value="item-1"
                className="bg-doser-surface border-doser-border rounded-lg"
              >
                <AccordionTrigger className="text-doser-text px-6 py-4 hover:no-underline">
                  Is there really a free plan?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-doser-text-muted">
                  Yes! Our Starter plan is completely free and includes basic
                  dosage calculations, safety guidelines, and 5 calculations per
                  day. Perfect for occasional users.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="bg-doser-surface border-doser-border rounded-lg"
              >
                <AccordionTrigger className="text-doser-text px-6 py-4 hover:no-underline">
                  Can I change plans anytime?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-doser-text-muted">
                  Absolutely! You can upgrade or downgrade your plan at any
                  time. Changes take effect immediately, and we&apos;ll prorate
                  your billing accordingly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="bg-doser-surface border-doser-border rounded-lg"
              >
                <AccordionTrigger className="text-doser-text px-6 py-4 hover:no-underline">
                  What&apos;s included in the free trial?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-doser-text-muted">
                  Our 7-day free trial gives you full access to all Pro
                  features, including unlimited calculations, session tracking,
                  and AI recommendations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="bg-doser-surface border-doser-border rounded-lg"
              >
                <AccordionTrigger className="text-doser-text px-6 py-4 hover:no-underline">
                  Is my data private and secure?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-doser-text-muted">
                  Your privacy is our top priority. All data is encrypted,
                  stored securely, and never shared with third parties. You can
                  export or delete your data anytime.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="bg-doser-surface border-doser-border rounded-lg"
              >
                <AccordionTrigger className="text-doser-text px-6 py-4 hover:no-underline">
                  Do you offer refunds?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-doser-text-muted">
                  We offer a 30-day money-back guarantee on all paid plans. If
                  you&apos;re not satisfied, contact our support team for a full
                  refund.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </>
  );
}
