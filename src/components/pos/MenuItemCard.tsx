import { Plus } from "lucide-react";
import type { MenuItem } from "@/types/pos";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddToOrder }: MenuItemCardProps) {
  return (
    <button
      onClick={() => onAddToOrder(item)}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl overflow-hidden",
        "border border-border hover:border-primary/50 transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
        "animate-scale-in"
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
      <div className="p-4 text-left">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {item.description}
          </p>
        )}
        <p className="text-lg font-bold text-primary mt-2">
          ${item.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
}
