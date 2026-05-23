import { useEffect, useState } from "react";
import { getCreditCustomers } from "../api/credit.api";
import type { CreditCustomer } from "../types/credit.types";

export function useCreditCustomers() {
  const [customers, setCustomers] = useState<CreditCustomer[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getCreditCustomers()
      .then((data) => {
        if (isCurrent) setCustomers(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load credit customers.",
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
    customers,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
