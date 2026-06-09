import { useEffect, useState } from "react";
import { getTodayRates, setTodayRates } from "../api/fuel-rates.api";
import type { FuelRate } from "../types/fuel-rates.types";

export function useTodayRates() {
  const [rates, setRates] = useState<FuelRate[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setIsPending(true);
    void getTodayRates()
      .then((data) => {
        if (isCurrent) setRates(data);
      })
      .catch(() => {
        if (isCurrent) setRates([]);
      })
      .finally(() => {
        if (isCurrent) setIsPending(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const save = async (newRates: FuelRate[]) => {
    setIsSaving(true);
    setError("");
    try {
      const saved = await setTodayRates(newRates);
      setRates(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rates.");
    } finally {
      setIsSaving(false);
    }
  };

  return { rates, isPending, isSaving, error, save };
}
