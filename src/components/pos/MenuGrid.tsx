import type { MenuItem } from "@/types/pos";
import { MenuItemCard } from "./MenuItemCard";
import { UtensilsCrossed } from "lucide-react";

interface MenuGridProps {
  items: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
  recentlyAdded?: string[];
  favorites?: string[];
  onToggleFavorite?: (itemId: string) => void;
}

export function MenuGrid({
  items,
  onAddToOrder,
  recentlyAdded = [],
  favorites = [],
  onToggleFavorite,
}: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <UtensilsCrossed className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-lg font-medium">No items found</p>
        <p className="text-sm">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-scale-in"
        >
          <MenuItemCard
            item={item}
            onAddToOrder={onAddToOrder}
            isRecentlyAdded={recentlyAdded.includes(item.id)}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
}
