import { Clock, User, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface POSHeaderProps {
  orderCount: number;
  onOpenCart: () => void;
}

export function POSHeader({ orderCount, onOpenCart }: POSHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold text-primary-foreground">R</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">RestoPOS</h1>
          <p className="text-xs text-muted-foreground">Table Service</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Server 01</span>
        </div>

        <button
          onClick={onOpenCart}
          className="lg:hidden relative p-3 bg-primary rounded-lg text-primary-foreground"
        >
          <ShoppingCart className="w-5 h-5" />
          {orderCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {orderCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
