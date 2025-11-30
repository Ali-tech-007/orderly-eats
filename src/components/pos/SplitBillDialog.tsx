import { useState, useMemo } from "react";
import { X, Plus, Minus, Users, Check, Banknote, CreditCard, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderItem, SplitBillPerson, PaymentMethod, PaymentData } from "@/types/pos";

interface SplitBillDialogProps {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  tableName?: string;
  onComplete: (paymentData: PaymentData) => void;
  onClose: () => void;
}

type SplitType = "equal" | "custom" | "byItem";

export function SplitBillDialog({
  items,
  subtotal,
  discount,
  tax,
  tip,
  tableName,
  onComplete,
  onClose,
}: SplitBillDialogProps) {
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [people, setPeople] = useState<SplitBillPerson[]>([
    { id: "1", name: "Person 1", amount: 0, paid: false },
    { id: "2", name: "Person 2", amount: 0, paid: false },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const grandTotal = subtotal - discount + tax + tip;

  const equalShare = useMemo(() => {
    return grandTotal / numberOfPeople;
  }, [grandTotal, numberOfPeople]);

  const customTotal = useMemo(() => {
    return people.reduce((sum, p) => sum + p.amount, 0);
  }, [people]);

  const allPaid = useMemo(() => {
    if (splitType === "equal") {
      return people.filter((p) => p.paid).length === numberOfPeople;
    }
    return people.every((p) => p.paid) && Math.abs(customTotal - grandTotal) < 0.01;
  }, [people, splitType, numberOfPeople, customTotal, grandTotal]);

  const handleNumberOfPeopleChange = (delta: number) => {
    const newCount = Math.max(2, Math.min(10, numberOfPeople + delta));
    setNumberOfPeople(newCount);

    // Adjust people array
    if (newCount > people.length) {
      const newPeople = [...people];
      for (let i = people.length; i < newCount; i++) {
        newPeople.push({
          id: `${i + 1}`,
          name: `Person ${i + 1}`,
          amount: 0,
          paid: false,
        });
      }
      setPeople(newPeople);
    } else {
      setPeople(people.slice(0, newCount));
    }
  };

  const handleUpdatePersonName = (id: string, name: string) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleUpdatePersonAmount = (id: string, amount: number) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, amount } : p))
    );
  };

  const handleTogglePaid = (id: string, method: PaymentMethod) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, paid: !p.paid || p.paymentMethod !== method, paymentMethod: method }
          : p
      )
    );
  };

  const handleAddPerson = () => {
    if (people.length < 10) {
      setPeople([
        ...people,
        {
          id: `${Date.now()}`,
          name: `Person ${people.length + 1}`,
          amount: 0,
          paid: false,
        },
      ]);
    }
  };

  const handleRemovePerson = (id: string) => {
    if (people.length > 2) {
      setPeople(people.filter((p) => p.id !== id));
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const finalPeople = splitType === "equal"
      ? people.map((p) => ({ ...p, amount: equalShare }))
      : people;

    const paymentData: PaymentData = {
      method: "cash", // Mixed methods tracked in splitBetween
      subtotal,
      discount,
      tax,
      tip,
      total: grandTotal,
      splitBetween: finalPeople,
    };

    setIsProcessing(false);
    onComplete(paymentData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Split Bill</h2>
              {tableName && (
                <p className="text-sm text-muted-foreground">{tableName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Total */}
          <div className="flex justify-between items-center p-3 bg-secondary rounded-xl">
            <span className="font-medium">Total Bill</span>
            <span className="text-xl font-bold text-primary">${grandTotal.toFixed(2)}</span>
          </div>

          {/* Split Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSplitType("equal")}
              className={cn(
                "p-3 rounded-xl font-medium transition-all touch-manipulation",
                splitType === "equal"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-foreground"
              )}
            >
              Split Equally
            </button>
            <button
              onClick={() => setSplitType("custom")}
              className={cn(
                "p-3 rounded-xl font-medium transition-all touch-manipulation",
                splitType === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-foreground"
              )}
            >
              Custom Amounts
            </button>
          </div>

          {/* Equal Split */}
          {splitType === "equal" && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <span className="font-medium">Number of People</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNumberOfPeopleChange(-1)}
                    disabled={numberOfPeople <= 2}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center disabled:opacity-50 touch-manipulation"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{numberOfPeople}</span>
                  <button
                    onClick={() => handleNumberOfPeopleChange(1)}
                    disabled={numberOfPeople >= 10}
                    className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center disabled:opacity-50 touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Each person pays</p>
                <p className="text-3xl font-bold text-primary">${equalShare.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                {people.slice(0, numberOfPeople).map((person, index) => (
                  <div
                    key={person.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all",
                      person.paid ? "bg-success/10 border border-success/20" : "bg-secondary"
                    )}
                  >
                    <span className="font-medium">Person {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">${equalShare.toFixed(2)}</span>
                      <button
                        onClick={() => handleTogglePaid(person.id, "cash")}
                        className={cn(
                          "p-2 rounded-lg transition-colors touch-manipulation",
                          person.paid && person.paymentMethod === "cash"
                            ? "bg-success text-success-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        <Banknote className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePaid(person.id, "card")}
                        className={cn(
                          "p-2 rounded-lg transition-colors touch-manipulation",
                          person.paid && person.paymentMethod === "card"
                            ? "bg-success text-success-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Split */}
          {splitType === "custom" && (
            <div className="space-y-3 animate-slide-up">
              {people.map((person) => (
                <div
                  key={person.id}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    person.paid ? "bg-success/10 border border-success/20" : "bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={person.name}
                      onChange={(e) => handleUpdatePersonName(person.id, e.target.value)}
                      className="flex-1 h-9"
                      placeholder="Name"
                    />
                    {people.length > 2 && (
                      <button
                        onClick={() => handleRemovePerson(person.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={person.amount || ""}
                        onChange={(e) =>
                          handleUpdatePersonAmount(person.id, parseFloat(e.target.value) || 0)
                        }
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      onClick={() => handleTogglePaid(person.id, "cash")}
                      className={cn(
                        "p-2 rounded-lg transition-colors touch-manipulation",
                        person.paid && person.paymentMethod === "cash"
                          ? "bg-success text-success-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <Banknote className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTogglePaid(person.id, "card")}
                      className={cn(
                        "p-2 rounded-lg transition-colors touch-manipulation",
                        person.paid && person.paymentMethod === "card"
                          ? "bg-success text-success-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddPerson}
                disabled={people.length >= 10}
                className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Person
              </button>

              {/* Custom Total Indicator */}
              <div
                className={cn(
                  "p-3 rounded-xl text-center",
                  Math.abs(customTotal - grandTotal) < 0.01
                    ? "bg-success/10 border border-success/20"
                    : "bg-destructive/10 border border-destructive/20"
                )}
              >
                <p className="text-sm">
                  Assigned: ${customTotal.toFixed(2)} / ${grandTotal.toFixed(2)}
                </p>
                {Math.abs(customTotal - grandTotal) >= 0.01 && (
                  <p className="text-xs text-destructive mt-1">
                    {customTotal < grandTotal
                      ? `$${(grandTotal - customTotal).toFixed(2)} remaining`
                      : `$${(customTotal - grandTotal).toFixed(2)} over`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <Button
            onClick={handleComplete}
            disabled={!allPaid || isProcessing}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 glow-primary touch-manipulation"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Complete Split Payment
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}