import { cn } from "@/lib/utils";
import type { Table, TableStatus } from "@/types/pos";
import { Users, Circle, Square, RectangleHorizontal, Clock, Sparkles } from "lucide-react";

interface TableMapProps {
  tables: Table[];
  selectedTable: string | null;
  onSelectTable: (tableId: string) => void;
  onUpdateStatus: (tableId: string, status: TableStatus) => void;
}

const statusConfig: Record<TableStatus, { color: string; label: string; icon: React.ReactNode }> = {
  available: { color: "bg-success/20 border-success text-success", label: "Available", icon: <Circle className="w-3 h-3 fill-current" /> },
  occupied: { color: "bg-primary/20 border-primary text-primary", label: "Occupied", icon: <Users className="w-3 h-3" /> },
  reserved: { color: "bg-blue-500/20 border-blue-500 text-blue-400", label: "Reserved", icon: <Clock className="w-3 h-3" /> },
  dirty: { color: "bg-muted border-muted-foreground text-muted-foreground", label: "Needs Cleaning", icon: <Sparkles className="w-3 h-3" /> },
};

export function TableMap({ tables, selectedTable, onSelectTable, onUpdateStatus }: TableMapProps) {
  const getShapeClass = (shape: Table['shape']) => {
    switch (shape) {
      case 'round': return 'rounded-full';
      case 'rectangle': return 'rounded-lg w-32';
      default: return 'rounded-lg';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-secondary/50 rounded-xl">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", config.color.split(' ')[0])} />
            <span className="text-sm text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Floor Plan */}
      <div className="flex-1 relative bg-secondary/30 rounded-xl p-6 min-h-[400px]">
        <div className="absolute inset-6 border-2 border-dashed border-border/50 rounded-lg" />
        
        <div className="relative h-full grid grid-cols-4 gap-4 auto-rows-fr">
          {tables.map((table) => {
            const config = statusConfig[table.status];
            const isSelected = selectedTable === table.id;
            
            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 border-2 transition-all duration-300",
                  "min-h-[100px] min-w-[80px]",
                  getShapeClass(table.shape),
                  config.color,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105",
                  "hover:scale-105 active:scale-95"
                )}
              >
                <span className="text-2xl font-bold">{table.number}</span>
                <div className="flex items-center gap-1 mt-1">
                  {config.icon}
                  <span className="text-xs">{table.seats} seats</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Table Actions */}
      {selectedTable && (
        <div className="mt-4 p-4 bg-card rounded-xl border border-border animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Table {tables.find(t => t.id === selectedTable)?.number}
            </h3>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              statusConfig[tables.find(t => t.id === selectedTable)?.status || 'available'].color
            )}>
              {statusConfig[tables.find(t => t.id === selectedTable)?.status || 'available'].label}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['available', 'occupied', 'reserved', 'dirty'] as TableStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(selectedTable, status)}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border transition-all",
                  tables.find(t => t.id === selectedTable)?.status === status
                    ? statusConfig[status].color
                    : "bg-secondary hover:bg-muted"
                )}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
