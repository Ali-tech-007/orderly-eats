import type { MenuItem } from "@/types/pos";
import { MenuItemCard } from "./MenuItemCard";

interface MenuGridProps {
  items: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
}

export function MenuGrid({ items, onAddToOrder }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No items found in this category
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onAddToOrder={onAddToOrder} />
      ))}
    </div>
  );
}
