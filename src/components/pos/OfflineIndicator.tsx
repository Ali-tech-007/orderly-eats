import { WifiOff, Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingOrdersCount: number;
  onSync?: () => void;
}

export function OfflineIndicator({
  isOnline,
  pendingOrdersCount,
  onSync,
}: OfflineIndicatorProps) {
  if (isOnline && pendingOrdersCount === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success text-xs">
            <Cloud className="w-3.5 h-3.5" />
            <span>Online</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected to server</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!isOnline) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
            {pendingOrdersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 bg-destructive/20 text-destructive"
              >
                {pendingOrdersCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Working offline. {pendingOrdersCount} order(s) pending sync.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Online but has pending orders to sync
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onSync}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
            "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          )}
        >
          <CloudOff className="w-3.5 h-3.5" />
          <span>Syncing...</span>
          <Badge
            variant="secondary"
            className="ml-1 h-5 px-1.5 bg-amber-500/20 text-amber-400"
          >
            {pendingOrdersCount}
          </Badge>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click to sync {pendingOrdersCount} pending order(s)</p>
      </TooltipContent>
    </Tooltip>
  );
}
