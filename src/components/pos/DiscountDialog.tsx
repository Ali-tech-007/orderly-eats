import { useState } from "react";
import { X, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DiscountDialogProps {
  subtotal: number;
  onApply: (amount: number, type: 'percentage' | 'fixed') => void;
  onClose: () => void;
}

export function DiscountDialog({ subtotal, onApply, onClose }: DiscountDialogProps) {
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [amount, setAmount] = useState("");

  const quickDiscounts = [5, 10, 15, 20, 25];

  const calculateDiscount = () => {
    const value = parseFloat(amount) || 0;
    if (type === 'percentage') {
      return (subtotal * value) / 100;
    }
    return value;
  };

  const handleApply = () => {
    const value = parseFloat(amount) || 0;
    if (value > 0) {
      onApply(value, type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Apply Discount</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setType('percentage')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all",
                type === 'percentage' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <Percent className="w-4 h-4" />
              Percentage
            </button>
            <button
              onClick={() => setType('fixed')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all",
                type === 'fixed' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <DollarSign className="w-4 h-4" />
              Fixed
            </button>
          </div>

          {/* Quick Discounts */}
          {type === 'percentage' && (
            <div className="flex flex-wrap gap-2">
              {quickDiscounts.map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value.toString())}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    amount === value.toString()
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-muted"
                  )}
                >
                  {value}%
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {type === 'percentage' ? '%' : '$'}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === 'percentage' ? "Enter percentage" : "Enter amount"}
              className="w-full h-14 pl-10 pr-4 bg-secondary border border-border rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-success font-semibold">
                  -${calculateDiscount().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-medium">New Total</span>
                <span className="font-bold text-primary">
                  ${(subtotal - calculateDiscount()).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button
            onClick={handleApply}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            Apply Discount
          </Button>
        </div>
      </div>
    </div>
  );
}
