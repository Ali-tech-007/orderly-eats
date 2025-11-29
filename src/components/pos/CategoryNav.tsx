import { cn } from "@/lib/utils";
import type { Category } from "@/types/pos";
import {
  Grid3X3,
  Sandwich,
  Pizza,
  UtensilsCrossed,
  Salad,
  Coffee,
  Cake,
} from "lucide-react";
import { useRef } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Grid3X3,
  Sandwich,
  Pizza,
  UtensilsCrossed,
  Salad,
  Coffee,
  Cake,
};

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <nav
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const Icon = iconMap[category.icon];
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                // Larger touch targets (minimum 44px height)
                "flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-medium transition-all duration-200",
                "whitespace-nowrap snap-start touch-manipulation",
                "border-2 min-h-[48px]",
                "active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground border-primary glow-primary"
                  : "bg-secondary text-secondary-foreground border-transparent hover:bg-muted hover:border-border"
              )}
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm sm:text-base">{category.name}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Fade indicators for scroll */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
    </div>
  );
}
