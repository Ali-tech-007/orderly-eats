import { Plus, Star } from "lucide-react";
import type { MenuItem } from "@/types/pos";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
  isRecentlyAdded?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
}

export function MenuItemCard({
  item,
  onAddToOrder,
  isRecentlyAdded,
  isFavorite,
  onToggleFavorite,
}: MenuItemCardProps) {
  return (
    <button
      onClick={() => onAddToOrder(item)}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl overflow-hidden",
        "border-2 transition-all duration-300",
        "active:scale-[0.98] touch-manipulation",
        // Larger touch targets - minimum 44px
        "min-h-[180px] sm:min-h-[200px]",
        isRecentlyAdded
          ? "border-success shadow-lg shadow-success/20 animate-pulse-subtle"
          : "border-border hover:border-primary/50",
        "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
      )}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={cn(
            "absolute top-2 left-2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all",
            "touch-manipulation",
            isFavorite
              ? "bg-primary text-primary-foreground"
              : "bg-background/60 backdrop-blur text-muted-foreground hover:text-primary"
          )}
        >
          <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      )}

      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Add Button - Larger for touch */}
        <div className="absolute bottom-3 right-3 w-12 h-12 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
          <Plus className="w-6 h-6 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
      </div>
      
      <div className="p-3 sm:p-4 text-left flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{item.name}</h3>
          {item.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5 sm:mt-1">
              {item.description}
            </p>
          )}
        </div>
        <p className="text-base sm:text-lg font-bold text-primary mt-2">
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Recently Added Indicator */}
      {isRecentlyAdded && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-success text-success-foreground text-xs font-medium rounded-full animate-scale-in">
          Added!
        </div>
      )}
    </button>
  );
}
