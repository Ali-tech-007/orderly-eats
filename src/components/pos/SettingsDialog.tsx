import { useState } from "react";
import { X, Settings, Percent, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { usePOSSettings } from "@/hooks/usePOSSettings";

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const { role, canAccess } = useAuth();
  const { taxRates, updateTaxRate, isLoading } = usePOSSettings();
  
  const [cashTaxRate, setCashTaxRate] = useState((taxRates.cash * 100).toString());
  const [cardTaxRate, setCardTaxRate] = useState((taxRates.card * 100).toString());
  const [isSaving, setIsSaving] = useState(false);

  const canEditSettings = canAccess(["admin", "manager"]);

  const handleSave = async () => {
    if (!canEditSettings) {
      toast.error("You don't have permission to change settings");
      return;
    }

    const cashRate = parseFloat(cashTaxRate) / 100;
    const cardRate = parseFloat(cardTaxRate) / 100;

    if (isNaN(cashRate) || isNaN(cardRate) || cashRate < 0 || cardRate < 0 || cashRate > 1 || cardRate > 1) {
      toast.error("Please enter valid tax rates between 0 and 100%");
      return;
    }

    setIsSaving(true);
    try {
      await updateTaxRate("cash", cashRate);
      await updateTaxRate("card", cardRate);
      toast.success("Settings saved successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">POS Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Role Info */}
          <div className="p-3 bg-secondary/50 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-semibold text-foreground capitalize">{role || "Unknown"}</span>
            </p>
            {!canEditSettings && (
              <p className="text-xs text-muted-foreground mt-1">
                Only managers and admins can modify settings.
              </p>
            )}
          </div>

          {/* Tax Rate Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Tax Rates
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cashTax">Cash Payment Tax Rate (%)</Label>
                <div className="relative">
                  <Input
                    id="cashTax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={cashTaxRate}
                    onChange={(e) => setCashTaxRate(e.target.value)}
                    disabled={!canEditSettings || isLoading}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Current: {(taxRates.cash * 100).toFixed(1)}%</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardTax">Card Payment Tax Rate (%)</Label>
                <div className="relative">
                  <Input
                    id="cardTax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={cardTaxRate}
                    onChange={(e) => setCardTaxRate(e.target.value)}
                    disabled={!canEditSettings || isLoading}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Current: {(taxRates.card * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <Button
            onClick={handleSave}
            disabled={!canEditSettings || isSaving}
            className="w-full h-12 font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
