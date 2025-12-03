import { Clock, User, ShoppingCart, LayoutGrid, UtensilsCrossed, LogOut, Settings, ChevronDown, ChefHat, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { OfflineIndicator } from "./OfflineIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = 'menu' | 'tables';

interface POSHeaderProps {
  orderCount: number;
  onOpenCart: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedTableName?: string;
  onOpenSettings?: () => void;
  isOnline?: boolean;
  pendingOrdersCount?: number;
  onSyncOrders?: () => void;
}

const roleColors: Record<string, string> = {
  admin: "text-red-400",
  manager: "text-blue-400",
  server: "text-green-400",
  kitchen: "text-orange-400",
};

export function POSHeader({
  orderCount,
  onOpenCart,
  viewMode,
  onViewModeChange,
  selectedTableName,
  onOpenSettings,
  isOnline = true,
  pendingOrdersCount = 0,
  onSyncOrders,
}: POSHeaderProps) {
  const navigate = useNavigate();
  const { profile, role, signOut, user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Staff";

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
        {/* Offline Indicator */}
        <OfflineIndicator
          isOnline={isOnline}
          pendingOrdersCount={pendingOrdersCount}
          onSync={onSyncOrders}
        />

        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="text-left">
                <span className="text-sm font-medium block">{displayName}</span>
                {role && (
                  <span className={cn("text-xs capitalize", roleColors[role] || "text-muted-foreground")}>
                    {role}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/kitchen")} className="cursor-pointer">
              <ChefHat className="w-4 h-4 mr-2" />
              Kitchen Display
            </DropdownMenuItem>
            {role === "admin" && (
              <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
