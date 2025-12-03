import { useState, useMemo } from "react";
import { X, CreditCard, Banknote, Calculator, Users, Check, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderItem, PaymentMethod, PaymentData, TipOption } from "@/types/pos";

interface PaymentDialogProps {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tableName?: string;
  taxRates: { cash: number; card: number };
  onComplete: (paymentData: PaymentData) => void;
  onSplitBill: () => void;
  onClose: () => void;
}

const tipOptions: TipOption[] = [
  { label: "No Tip", percentage: 0 },
  { label: "10%", percentage: 10 },
  { label: "15%", percentage: 15 },
  { label: "20%", percentage: 20 },
];

const quickCashAmounts = [20, 50, 100];

export function PaymentDialog({
  items,
  subtotal,
  discount,
  tableName,
  taxRates,
  onComplete,
  onSplitBill,
  onClose,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedTipPercent, setSelectedTipPercent] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");

  // Calculate tax based on payment method using passed-in rates
  const taxRate = paymentMethod ? taxRates[paymentMethod] : taxRates.cash;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * taxRate;

  const tipAmount = useMemo(() => {
    if (customTip) return parseFloat(customTip) || 0;
    if (selectedTipPercent !== null) return (subtotal * selectedTipPercent) / 100;
    return 0;
  }, [subtotal, selectedTipPercent, customTip]);

  const totalBeforeTip = subtotal - discount + tax;
  const grandTotal = totalBeforeTip + tipAmount;

  const change = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0;
    return tendered > grandTotal ? tendered - grandTotal : 0;
  }, [cashTendered, grandTotal]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    return cleaned;
  };

  const cardLastFour = cardNumber.replace(/\s/g, "").slice(-4);
  const isCardValid = cardNumber.replace(/\s/g, "").length >= 13 && 
                      cardExpiry.length === 5 && 
                      cardCVV.length >= 3 &&
                      cardName.length >= 2;

  const canComplete = useMemo(() => {
    if (!paymentMethod) return false;
    if (paymentMethod === "cash") {
      const tendered = parseFloat(cashTendered) || 0;
      return tendered >= grandTotal;
    }
    return isCardValid;
  }, [paymentMethod, cashTendered, grandTotal, isCardValid]);

  const handleSelectTip = (percentage: number) => {
    setSelectedTipPercent(percentage);
    setCustomTip("");
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setSelectedTipPercent(null);
  };

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const handleComplete = async () => {
    if (!paymentMethod) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const paymentData: PaymentData = {
      method: paymentMethod,
      subtotal,
      discount,
      tax,
      tip: tipAmount,
      total: grandTotal,
      ...(paymentMethod === "cash" && {
        cashTendered: parseFloat(cashTendered),
        change,
      }),
      ...(paymentMethod === "card" && { cardLastFour }),
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
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment</h2>
            {tableName && (
              <p className="text-sm text-muted-foreground">{tableName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Order Summary */}
          <div className="space-y-2 p-3 bg-secondary rounded-xl">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal ({items.length} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax ({paymentMethod ? `${(taxRates[paymentMethod] * 100).toFixed(0)}%` : `${(taxRates.cash * 100).toFixed(0)}%`})</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {paymentMethod && (
              <div className="flex justify-between text-xs text-blue-400">
                <span>
                  {paymentMethod === 'card' 
                    ? `💳 Card: ${(taxRates.card * 100).toFixed(0)}% tax` 
                    : `💵 Cash: ${(taxRates.cash * 100).toFixed(0)}% tax`}
                </span>
              </div>
            )}
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span>Tip</span>
                <span>${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Tip Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Add Tip</label>
            <div className="grid grid-cols-4 gap-2">
              {tipOptions.map((option) => (
                <button
                  key={option.percentage}
                  onClick={() => handleSelectTip(option.percentage)}
                  className={cn(
                    "p-3 rounded-xl text-sm font-medium transition-all touch-manipulation",
                    selectedTipPercent === option.percentage && !customTip
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="Custom tip amount"
                value={customTip}
                onChange={(e) => handleCustomTipChange(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all touch-manipulation",
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Banknote className={cn("w-8 h-8", paymentMethod === "cash" ? "text-primary" : "text-muted-foreground")} />
                <span className="font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all touch-manipulation",
                  paymentMethod === "card"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <CreditCard className={cn("w-8 h-8", paymentMethod === "card" ? "text-primary" : "text-muted-foreground")} />
                <span className="font-medium">Card</span>
              </button>
            </div>
          </div>

          {/* Cash Input */}
          {paymentMethod === "cash" && (
            <div className="space-y-3 animate-slide-up">
              <label className="text-sm font-medium text-muted-foreground">Cash Tendered</label>
              <div className="flex gap-2">
                {quickCashAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickCash(amount)}
                    className="flex-1 p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors touch-manipulation"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="pl-7 text-lg h-12"
                />
              </div>
              {change > 0 && (
                <div className="flex justify-between p-3 bg-success/10 border border-success/20 rounded-xl">
                  <span className="font-medium text-success">Change Due</span>
                  <span className="font-bold text-success">${change.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Card Input */}
          {paymentMethod === "card" && (
            <div className="space-y-4 animate-slide-up">
              {/* Card Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 text-lg h-12 tracking-wider font-mono"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Cardholder Name</label>
                <Input
                  type="text"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="h-12 uppercase"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={formatExpiry(cardExpiry)}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, ""))}
                    className="h-12 text-center tracking-wider font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">CVV</label>
                  <Input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ""))}
                    className="h-12 text-center tracking-wider"
                  />
                </div>
              </div>

              {/* Card validation status */}
              <div className={cn(
                "p-3 rounded-xl text-center text-sm",
                isCardValid 
                  ? "bg-success/10 border border-success/20 text-success" 
                  : "bg-secondary text-muted-foreground"
              )}>
                {isCardValid 
                  ? "✓ Card details valid - Ready to process" 
                  : "Enter card details to continue"}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-secondary/30 space-y-3">
          <button
            onClick={onSplitBill}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors touch-manipulation"
          >
            <Users className="w-5 h-5" />
            Split Bill
          </button>
          
          <Button
            onClick={handleComplete}
            disabled={!canComplete || isProcessing}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 glow-primary touch-manipulation"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Calculator className="w-5 h-5 animate-pulse" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Complete Payment ${grandTotal.toFixed(2)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}