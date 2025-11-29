import { Send, Split, Percent, Receipt, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  hasItems: boolean;
  onSendToKitchen: () => void;
  onSplitBill: () => void;
  onApplyDiscount: () => void;
  onPrintReceipt: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function QuickActions({
  hasItems,
  onSendToKitchen,
  onSplitBill,
  onApplyDiscount,
  onPrintReceipt,
  onUndo,
  canUndo,
}: QuickActionsProps) {
  const actions = [
    { icon: Send, label: "Kitchen", onClick: onSendToKitchen, disabled: !hasItems, primary: true },
    { icon: Split, label: "Split", onClick: onSplitBill, disabled: !hasItems },
    { icon: Percent, label: "Discount", onClick: onApplyDiscount, disabled: !hasItems },
    { icon: Receipt, label: "Receipt", onClick: onPrintReceipt, disabled: !hasItems },
    { icon: RotateCcw, label: "Undo", onClick: onUndo, disabled: !canUndo },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 min-w-[70px]",
            "border border-transparent",
            action.disabled
              ? "opacity-40 cursor-not-allowed bg-muted"
              : action.primary
              ? "bg-success/20 text-success hover:bg-success/30 border-success/30"
              : "bg-secondary hover:bg-muted hover:border-border active:scale-95"
          )}
        >
          <action.icon className="w-5 h-5" />
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
