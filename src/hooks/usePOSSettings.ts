import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TaxSettings {
  cash: number;
  card: number;
}

export function usePOSSettings() {
  const [taxRates, setTaxRates] = useState<TaxSettings>({ cash: 0.15, card: 0.05 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("pos_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      if (data) {
        const newTaxRates = { ...taxRates };
        data.forEach((setting) => {
          if (setting.setting_key === "tax_rate_cash") {
            newTaxRates.cash = (setting.setting_value as { rate: number }).rate;
          } else if (setting.setting_key === "tax_rate_card") {
            newTaxRates.card = (setting.setting_value as { rate: number }).rate;
          }
        });
        setTaxRates(newTaxRates);
      }
    } catch (error) {
      console.error("Error fetching POS settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaxRate = async (type: "cash" | "card", rate: number) => {
    const settingKey = type === "cash" ? "tax_rate_cash" : "tax_rate_card";
    
    const { error } = await supabase
      .from("pos_settings")
      .update({ setting_value: { rate } })
      .eq("setting_key", settingKey);

    if (error) {
      throw error;
    }

    setTaxRates((prev) => ({ ...prev, [type]: rate }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    taxRates,
    isLoading,
    updateTaxRate,
    refetch: fetchSettings,
  };
}
