import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem, OrderModifier } from "@/types/pos";
import { modifierPresets } from "@/data/tableData";
import { Button } from "@/components/ui/button";

interface ModifierDialogProps {
  item: MenuItem;
  onConfirm: (item: MenuItem, modifiers: string[], notes: string) => void;
  onClose: () => void;
}

export function ModifierDialog({ item, onConfirm, onClose }: ModifierDialogProps) {
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const toggleModifier = (modifierId: string) => {
    setSelectedModifiers((prev) =>
      prev.includes(modifierId)
        ? prev.filter((id) => id !== modifierId)
        : [...prev, modifierId]
    );
  };

  const calculateTotal = () => {
    const modifiersCost = selectedModifiers.reduce((sum, id) => {
      const modifier = modifierPresets.find((m) => m.id === id);
      return sum + (modifier?.price || 0);
    }, 0);
    return (item.price + modifiersCost) * quantity;
  };

  const handleConfirm = () => {
    for (let i = 0; i < quantity; i++) {
      onConfirm(item, selectedModifiers, notes);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative h-32 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
            <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Quantity */}
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modifiers */}
          <div>
            <h3 className="font-medium mb-3">Customize</h3>
            <div className="grid grid-cols-2 gap-2">
              {modifierPresets.map((modifier) => {
                const isSelected = selectedModifiers.includes(modifier.id);
                return (
                  <button
                    key={modifier.id}
                    onClick={() => toggleModifier(modifier.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{modifier.name}</span>
                      {modifier.price && (
                        <span className="text-xs text-muted-foreground">+${modifier.price.toFixed(2)}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <h3 className="font-medium mb-2">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              className="w-full p-3 bg-secondary border border-border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/50">
          <Button
            onClick={handleConfirm}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
          >
            Add to Order - ${calculateTotal().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
