import { useEffect, useState } from "react";
import type { Sale } from "../../shift/types/shift.types";
import { getSales } from "../api/sales.api";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getSales()
      .then((data) => {
        if (isCurrent) setSales(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load sales.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsPending(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadToken]);

  return {
    sales,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
