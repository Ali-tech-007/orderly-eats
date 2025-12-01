import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Table, TableStatus } from "@/types/pos";
import { Users, Circle, Clock, Sparkles, Merge, List, Grid3X3, GripVertical } from "lucide-react";
import { DndContext, DragEndEvent, useDraggable, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TableMapProps {
  tables: Table[];
  selectedTable: string | null;
  onSelectTable: (tableId: string) => void;
  onUpdateStatus: (tableId: string, status: TableStatus) => void;
  onUpdatePosition?: (tableId: string, position: { x: number; y: number }) => void;
  onMergeTables?: (tableIds: string[]) => void;
  onUnmergeTables?: (tableId: string) => void;
}

const statusConfig: Record<TableStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  available: { 
    color: "border-success text-success", 
    bgColor: "bg-success/10",
    label: "Available", 
    icon: <Circle className="w-3 h-3 fill-current" /> 
  },
  occupied: { 
    color: "border-primary text-primary", 
    bgColor: "bg-primary/10",
    label: "Occupied", 
    icon: <Users className="w-3 h-3" /> 
  },
  reserved: { 
    color: "border-blue-500 text-blue-400", 
    bgColor: "bg-blue-500/10",
    label: "Reserved", 
    icon: <Clock className="w-3 h-3" /> 
  },
  dirty: { 
    color: "border-muted-foreground text-muted-foreground", 
    bgColor: "bg-muted/30",
    label: "Needs Cleaning", 
    icon: <Sparkles className="w-3 h-3" /> 
  },
};

interface DraggableTableProps {
  table: Table;
  isSelected: boolean;
  isMultiSelected: boolean;
  onSelect: (tableId: string, multiSelect: boolean) => void;
  containerSize: { width: number; height: number };
  isMobile: boolean;
}

function DraggableTable({ table, isSelected, isMultiSelected, onSelect, containerSize, isMobile }: DraggableTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    disabled: isMobile,
  });

  const config = statusConfig[table.status];
  
  // Size based on seats
  const getSize = () => {
    const baseSize = isMobile ? 60 : 80;
    const seatMultiplier = Math.min(table.seats / 4, 2);
    const size = baseSize + (seatMultiplier * (isMobile ? 10 : 15));
    return { width: table.shape === 'rectangle' ? size * 1.5 : size, height: size };
  };

  const { width, height } = getSize();

  // Convert percentage position to pixels
  const left = (table.position.x / 100) * containerSize.width;
  const top = (table.position.y / 100) * containerSize.height;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: transform ? left + transform.x : left,
    top: transform ? top + transform.y : top,
    width,
    height,
    zIndex: isDragging ? 100 : isSelected ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isMobile ? 'pointer' : 'grab',
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(table.id, e.shiftKey || e.metaKey);
  };

  // Capacity indicator dots
  const maxDots = Math.min(table.seats, 8);
  const occupiedDots = table.status === 'occupied' ? maxDots : table.status === 'reserved' ? Math.ceil(maxDots / 2) : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={cn(
              "flex flex-col items-center justify-center border-2 transition-all duration-200 touch-manipulation",
              table.shape === 'round' ? 'rounded-full' : 'rounded-xl',
              config.color,
              config.bgColor,
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105",
              isMultiSelected && !isSelected && "ring-2 ring-blue-500 ring-offset-1 ring-offset-background",
              isDragging && "shadow-2xl scale-110",
              "hover:scale-105 active:scale-95"
            )}
          >
            {/* Drag handle indicator - desktop only */}
            {!isMobile && (
              <GripVertical className="absolute top-1 right-1 w-3 h-3 text-muted-foreground/50" />
            )}
            
            <span className="text-lg sm:text-xl font-bold">{table.number}</span>
            <div className="flex items-center gap-1 mt-0.5">
              {config.icon}
              <span className="text-[10px] sm:text-xs">{table.seats}</span>
            </div>

            {/* Capacity indicator dots */}
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: maxDots }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i < occupiedDots ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {/* Merged indicator */}
            {table.mergedWith && table.mergedWith.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Merge className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-border">
          <div className="text-sm">
            <p className="font-semibold">Table {table.number}</p>
            <p className="text-muted-foreground">{table.seats} seats • {config.label}</p>
            {table.mergedWith && table.mergedWith.length > 0 && (
              <p className="text-blue-400">Merged table</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// List view for mobile
function TableListItem({ table, isSelected, onSelect }: { table: Table; isSelected: boolean; onSelect: (id: string) => void }) {
  const config = statusConfig[table.status];

  return (
    <button
      onClick={() => onSelect(table.id)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all touch-manipulation",
        config.color,
        config.bgColor,
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-lg",
        table.shape === 'round' ? 'rounded-full' : 'rounded-lg',
        "border-2",
        config.color
      )}>
        <span className="font-bold">{table.number}</span>
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">Table {table.number}</p>
        <p className="text-sm text-muted-foreground">{table.seats} seats</p>
      </div>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="text-sm">{config.label}</span>
      </div>
    </button>
  );
}

export function TableMap({ 
  tables, 
  selectedTable, 
  onSelectTable, 
  onUpdateStatus,
  onUpdatePosition,
  onMergeTables,
  onUnmergeTables 
}: TableMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');
  const [multiSelectedTables, setMultiSelectedTables] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (onUpdatePosition && delta) {
      const tableId = active.id as string;
      const table = tables.find(t => t.id === tableId);
      if (table) {
        // Convert pixel delta to percentage
        const newX = Math.max(0, Math.min(90, table.position.x + (delta.x / containerSize.width) * 100));
        const newY = Math.max(0, Math.min(85, table.position.y + (delta.y / containerSize.height) * 100));
        
        // Snap to grid (5% increments)
        const snappedX = Math.round(newX / 5) * 5;
        const snappedY = Math.round(newY / 5) * 5;
        
        onUpdatePosition(tableId, { x: snappedX, y: snappedY });
        
        // Save to localStorage
        const savedPositions = JSON.parse(localStorage.getItem('tablePositions') || '{}');
        savedPositions[tableId] = { x: snappedX, y: snappedY };
        localStorage.setItem('tablePositions', JSON.stringify(savedPositions));
      }
    }
  };

  const handleSelectTable = (tableId: string, multiSelect: boolean) => {
    if (multiSelect) {
      setMultiSelectedTables(prev => 
        prev.includes(tableId) 
          ? prev.filter(id => id !== tableId)
          : [...prev, tableId]
      );
    } else {
      setMultiSelectedTables([]);
      onSelectTable(tableId);
    }
  };

  const handleMergeTables = () => {
    if (onMergeTables && multiSelectedTables.length >= 2) {
      onMergeTables(multiSelectedTables);
      setMultiSelectedTables([]);
    }
  };

  const handleUnmerge = () => {
    if (onUnmergeTables && selectedTable) {
      onUnmergeTables(selectedTable);
    }
  };

  // Filter out child tables that are merged into parent tables
  const visibleTables = tables.filter(t => !t.parentTableId);
  const selectedTableData = tables.find(t => t.id === selectedTable);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* View Toggle & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-secondary/50 rounded-xl">
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('floor')}
            className={cn(
              "p-2 rounded-lg transition-colors touch-manipulation",
              viewMode === 'floor' ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted"
            )}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-colors touch-manipulation",
              viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted"
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-full", config.bgColor, "border", config.color.split(' ')[0])} />
              <span className="text-xs text-muted-foreground hidden sm:inline">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Merge button */}
        {multiSelectedTables.length >= 2 && onMergeTables && (
          <button
            onClick={handleMergeTables}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium animate-scale-in touch-manipulation"
          >
            <Merge className="w-4 h-4" />
            Merge {multiSelectedTables.length} Tables
          </button>
        )}
      </div>

      {/* Floor Plan View */}
      {viewMode === 'floor' ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div 
            ref={containerRef}
            className="flex-1 relative bg-secondary/20 rounded-xl overflow-hidden min-h-[350px] sm:min-h-[400px]"
          >
            {/* Grid overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '10% 10%',
              }}
            />

            {/* Floor boundary */}
            <div className="absolute inset-4 border-2 border-dashed border-border/50 rounded-xl pointer-events-none" />

            {/* Tables */}
            {visibleTables.map((table) => (
              <DraggableTable
                key={table.id}
                table={table}
                isSelected={selectedTable === table.id}
                isMultiSelected={multiSelectedTables.includes(table.id)}
                onSelect={handleSelectTable}
                containerSize={containerSize}
                isMobile={isMobile}
              />
            ))}

            {/* Mobile hint */}
            {isMobile && (
              <p className="absolute bottom-2 left-2 right-2 text-center text-xs text-muted-foreground">
                Tap to select • Use list view for easier access
              </p>
            )}
          </div>
        </DndContext>
      ) : (
        /* List View */
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {visibleTables.map((table) => (
            <TableListItem
              key={table.id}
              table={table}
              isSelected={selectedTable === table.id}
              onSelect={(id) => handleSelectTable(id, false)}
            />
          ))}
        </div>
      )}

      {/* Selected Table Actions */}
      {selectedTable && selectedTableData && (
        <div className="p-4 bg-card rounded-xl border border-border animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Table {selectedTableData.number}
              {selectedTableData.mergedWith && selectedTableData.mergedWith.length > 0 && (
                <span className="ml-2 text-sm text-blue-400">(Merged)</span>
              )}
            </h3>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              statusConfig[selectedTableData.status].bgColor,
              statusConfig[selectedTableData.status].color
            )}>
              {statusConfig[selectedTableData.status].label}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(['available', 'occupied', 'reserved', 'dirty'] as TableStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(selectedTable, status)}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border transition-all touch-manipulation",
                  selectedTableData.status === status
                    ? cn(statusConfig[status].bgColor, statusConfig[status].color)
                    : "bg-secondary hover:bg-muted"
                )}
              >
                {statusConfig[status].label}
              </button>
            ))}
            
            {/* Unmerge button */}
            {selectedTableData.mergedWith && selectedTableData.mergedWith.length > 0 && onUnmergeTables && (
              <button
                onClick={handleUnmerge}
                className="px-3 py-2 text-sm rounded-lg bg-destructive/20 border border-destructive text-destructive hover:bg-destructive/30 transition-all touch-manipulation"
              >
                Unmerge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
