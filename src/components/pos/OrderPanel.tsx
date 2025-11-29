import { Minus, Plus, Trash2, ShoppingBag, X, ChevronDown, ChevronUp } from "lucide-react";
import type { OrderItem } from "@/types/pos";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuickActions } from "./QuickActions";
import { useState } from "react";

interface OrderPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearOrder: () => void;
  onCheckout: () => void;
  onSendToKitchen: () => void;
  onSplitBill: () => void;
  onApplyDiscount: () => void;
  onUndo: () => void;
  canUndo: boolean;
  discount?: { amount: number; type: 'percentage' | 'fixed' };
  isOpen?: boolean;
  onClose?: () => void;
  tableName?: string;
}

export function OrderPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onCheckout,
  onSendToKitchen,
  onSplitBill,
  onApplyDiscount,
  onUndo,
  canUndo,
  discount,
  isOpen,
  onClose,
  tableName,
}: OrderPanelProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const discountAmount = discount
    ? discount.type === 'percentage'
      ? (subtotal * discount.amount) / 100
      : discount.amount
    : 0;
  
  const tax = (subtotal - discountAmount) * 0.1;
  const total = subtotal - discountAmount + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-l border-border",
        "lg:relative lg:translate-x-0",
        "fixed inset-y-0 right-0 z-50 w-full sm:w-96 transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Current Order</h2>
            {tableName && <span className="text-xs text-muted-foreground">{tableName}</span>}
          </div>
          {itemCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-scale-in">
              {itemCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={onClearOrder}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors touch-manipulation"
              title="Clear order"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border">
        <QuickActions
          hasItems={items.length > 0}
          onSendToKitchen={onSendToKitchen}
          onSplitBill={onSplitBill}
          onApplyDiscount={onApplyDiscount}
          onPrintReceipt={() => {}}
          onUndo={onUndo}
          canUndo={canUndo}
        />
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
            <p>No items in order</p>
            <p className="text-sm">Tap items to add them</p>
          </div>
        ) : (
          items.map((item, index) => {
            const isExpanded = expandedItems.includes(item.id);
            const hasModifiers = (item.modifiers && item.modifiers.length > 0) || item.notes;
            
            return (
              <div
                key={`${item.id}-${index}`}
                className={cn(
                  "p-3 bg-secondary rounded-xl transition-all duration-300",
                  "animate-slide-up border-2 border-transparent",
                  "hover:border-border"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                      {hasModifiers && (
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-primary font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? onRemoveItem(item.id)
                          : onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors touch-manipulation"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-colors touch-manipulation"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Modifiers & Notes */}
                {isExpanded && hasModifiers && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1 animate-slide-up">
                    {item.modifiers?.map((mod, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {mod}</p>
                    ))}
                    {item.notes && (
                      <p className="text-xs text-primary italic">Note: {item.notes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-border p-4 space-y-4 bg-secondary/30">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount && discountAmount > 0 && (
            <div className="flex justify-between text-success animate-slide-up">
              <span>Discount ({discount.type === 'percentage' ? `${discount.amount}%` : 'Fixed'})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed glow-primary touch-manipulation"
        >
          {items.length === 0 ? "Add items to order" : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>
    </aside>
  );
}
