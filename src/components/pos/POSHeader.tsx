import { Clock, User, ShoppingCart, LayoutGrid, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ViewMode = 'menu' | 'tables';

interface POSHeaderProps {
  orderCount: number;
  onOpenCart: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedTableName?: string;
}

export function POSHeader({
  orderCount,
  onOpenCart,
  viewMode,
  onViewModeChange,
  selectedTableName,
}: POSHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold text-primary-foreground">R</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-foreground">RestoPOS</h1>
          <p className="text-xs text-muted-foreground">
            {selectedTableName || "Table Service"}
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => onViewModeChange('menu')}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all touch-manipulation",
            viewMode === 'menu'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Menu</span>
        </button>
        <button
          onClick={() => onViewModeChange('tables')}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all touch-manipulation",
            viewMode === 'tables'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Tables</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Server 01</span>
        </div>

        <button
          onClick={onOpenCart}
          className="lg:hidden relative p-3 bg-primary rounded-lg text-primary-foreground touch-manipulation active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          {orderCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
              {orderCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
