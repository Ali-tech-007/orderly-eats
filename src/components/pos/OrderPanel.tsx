import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import type { OrderItem } from "@/types/pos";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OrderPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearOrder: () => void;
  onCheckout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function OrderPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onCheckout,
  isOpen,
  onClose,
}: OrderPanelProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
          <h2 className="font-semibold text-lg">Current Order</h2>
          {itemCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={onClearOrder}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Clear order"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
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
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg animate-slide-up"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-primary font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    item.quantity === 1
                      ? onRemoveItem(item.id)
                      : onUpdateQuantity(item.id, item.quantity - 1)
                  }
                  className="w-8 h-8 rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
                >
                  {item.quantity === 1 ? (
                    <Trash2 className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-border p-4 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
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
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
        >
          {items.length === 0 ? "Add items to order" : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>
    </aside>
  );
}
