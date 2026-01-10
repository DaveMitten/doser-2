"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Carousel({ children, className, ...props }: CarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollButtons = React.useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener("scroll", checkScrollButtons);

    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollButtons);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScrollButtons);
      resizeObserver.disconnect();
    };
  }, [checkScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth =
      container.querySelector("[data-carousel-item]")?.clientWidth || 0;
    const gap = 12; // gap-3 = 12px
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-doser-surface/90 backdrop-blur-sm border border-doser-border hover:bg-doser-surface-hover shadow-lg"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-doser-surface/90 backdrop-blur-sm border border-doser-border hover:bg-doser-surface-hover shadow-lg"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex items-stretch gap-3 overflow-x-auto scrollbar-hide",
          "scroll-smooth snap-x snap-mandatory",
          "[&>*]:flex-shrink-0 [&>*]:snap-start"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CarouselItem({
  children,
  className,
  ...props
}: CarouselItemProps) {
  return (
    <div
      data-carousel-item
      className={cn(
        "snap-start h-full flex self-stretch items-stretch",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
