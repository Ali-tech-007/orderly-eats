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
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = iconMap[category.icon];
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap",
              "border border-transparent",
              isActive
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-muted hover:border-border"
            )}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span className="hidden sm:inline">{category.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
