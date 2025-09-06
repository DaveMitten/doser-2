import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  value: string;
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  subtitle: string;
  items: FAQItem[];
  className?: string;
}

export function FAQ({ title, subtitle, items, className = "" }: FAQProps) {
  return (
    <section className={`container mx-auto px-6 py-16 ${className}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-doser-text mb-4">
          {title}
        </h1>
        <p className="text-xl text-doser-text-muted">{subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {items.map((item) => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="bg-doser-surface border-doser-border rounded-lg"
            >
              <AccordionTrigger className="text-doser-text px-6 py-4 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-doser-text-muted">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
