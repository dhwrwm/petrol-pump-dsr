import { useEffect, useState } from "react";
import { getSalesSummary } from "../api/dashboard.api";
import type { SalesSummary } from "../types/dashboard.types";

export function useSalesSummary(period: "week" | "month") {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getSalesSummary(period)
      .then((data) => {
        if (isCurrent) setSummary(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load sales summary.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsPending(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [period, reloadToken]);

  return {
    summary,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
