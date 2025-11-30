import { useState, useRef } from "react";
import { X, Printer, Mail, Download, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Receipt } from "@/types/pos";
import { toast } from "sonner";

interface ReceiptDialogProps {
  receipt: Receipt;
  onClose: () => void;
  onEmailReceipt?: (email: string) => Promise<void>;
}

export function ReceiptDialog({
  receipt,
  onClose,
  onEmailReceipt,
}: ReceiptDialogProps) {
  const [email, setEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${receipt.orderNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
              font-size: 12px;
            }
            .header { text-align: center; margin-bottom: 15px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { margin: 5px 0; color: #666; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .item-name { flex: 1; }
            .total-row { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 15px; color: #666; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RestoPOS</h1>
            <p>${receipt.tableName || 'Counter Order'}</p>
            <p>${formatDate(receipt.timestamp)}</p>
            <p>Order #${receipt.orderNumber}</p>
          </div>
          <div class="divider"></div>
          ${receipt.orderItems.map(item => `
            <div class="item">
              <span class="item-name">${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            ${item.modifiers?.map(mod => `<div class="item"><span style="padding-left: 10px; color: #666;">+ ${mod}</span></div>`).join('') || ''}
            ${item.notes ? `<div class="item"><span style="padding-left: 10px; font-style: italic; color: #666;">Note: ${item.notes}</span></div>` : ''}
          `).join('')}
          <div class="divider"></div>
          <div class="item">
            <span>Subtotal</span>
            <span>$${receipt.payment.subtotal.toFixed(2)}</span>
          </div>
          ${receipt.payment.discount > 0 ? `
            <div class="item" style="color: green;">
              <span>Discount</span>
              <span>-$${receipt.payment.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item">
            <span>Tax (10%)</span>
            <span>$${receipt.payment.tax.toFixed(2)}</span>
          </div>
          ${receipt.payment.tip > 0 ? `
            <div class="item">
              <span>Tip</span>
              <span>$${receipt.payment.tip.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="item total-row">
            <span>TOTAL</span>
            <span>$${receipt.payment.total.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="item">
            <span>Payment</span>
            <span>${receipt.payment.method === 'cash' ? 'Cash' : `Card ****${receipt.payment.cardLastFour || ''}`}</span>
          </div>
          ${receipt.payment.method === 'cash' && receipt.payment.cashTendered ? `
            <div class="item">
              <span>Cash Tendered</span>
              <span>$${receipt.payment.cashTendered.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Change</span>
              <span>$${(receipt.payment.change || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Please come again</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();

    toast.success("Receipt sent to printer", { duration: 2000 });
  };

  const handleEmailReceipt = async () => {
    if (!email || !onEmailReceipt) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      await onEmailReceipt(email);
      setEmailSent(true);
      toast.success(`Receipt sent to ${email}`, { duration: 3000 });
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    }
    setIsSendingEmail(false);
  };

  const handleCopyReceipt = () => {
    const receiptText = `
RestoPOS Receipt
${receipt.tableName || 'Counter Order'}
${formatDate(receipt.timestamp)}
Order #${receipt.orderNumber}

${receipt.orderItems.map(item => 
  `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${receipt.payment.subtotal.toFixed(2)}
${receipt.payment.discount > 0 ? `Discount: -$${receipt.payment.discount.toFixed(2)}\n` : ''}Tax: $${receipt.payment.tax.toFixed(2)}
${receipt.payment.tip > 0 ? `Tip: $${receipt.payment.tip.toFixed(2)}\n` : ''}
TOTAL: $${receipt.payment.total.toFixed(2)}

Payment: ${receipt.payment.method === 'cash' ? 'Cash' : `Card ****${receipt.payment.cardLastFour || ''}`}

Thank you for dining with us!
    `.trim();

    navigator.clipboard.writeText(receiptText);
    toast.success("Receipt copied to clipboard", { duration: 2000 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="p-4 max-h-[50vh] overflow-y-auto bg-secondary/20"
        >
          <div className="bg-background rounded-xl p-4 shadow-inner space-y-3 font-mono text-sm">
            {/* Header */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold">RestoPOS</h3>
              {receipt.tableName && (
                <p className="text-muted-foreground">{receipt.tableName}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(receipt.timestamp)}</p>
              <p className="text-xs text-muted-foreground">Order #{receipt.orderNumber}</p>
            </div>

            <div className="border-t border-dashed border-border pt-3">
              {/* Items */}
              {receipt.orderItems.map((item, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.modifiers?.map((mod, i) => (
                    <p key={i} className="text-xs text-muted-foreground pl-4">+ {mod}</p>
                  ))}
                  {item.notes && (
                    <p className="text-xs text-muted-foreground italic pl-4">Note: {item.notes}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-border pt-3 space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${receipt.payment.subtotal.toFixed(2)}</span>
              </div>
              {receipt.payment.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-${receipt.payment.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (10%)</span>
                <span>${receipt.payment.tax.toFixed(2)}</span>
              </div>
              {receipt.payment.tip > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tip</span>
                  <span>${receipt.payment.tip.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-border pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span className="text-primary">${receipt.payment.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-border pt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Payment</span>
                <span>
                  {receipt.payment.method === "cash"
                    ? "Cash"
                    : `Card ****${receipt.payment.cardLastFour || ""}`}
                </span>
              </div>
              {receipt.payment.method === "cash" && receipt.payment.cashTendered && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered</span>
                    <span>${receipt.payment.cashTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>${(receipt.payment.change || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center pt-2 text-xs text-muted-foreground">
              <p>Thank you for dining with us!</p>
              <p>Please come again</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-secondary/30 space-y-3">
          {/* Email Input */}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Email receipt to..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailSent || isSendingEmail}
              className="flex-1"
            />
            <Button
              onClick={handleEmailReceipt}
              disabled={!email || emailSent || isSendingEmail || !onEmailReceipt}
              variant="outline"
              className="px-4"
            >
              {emailSent ? (
                <Check className="w-4 h-4 text-success" />
              ) : isSendingEmail ? (
                <Mail className="w-4 h-4 animate-pulse" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCopyReceipt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}