import { useEffect, useState } from "react";
import { getPumpBoys } from "../api/pump-boys.api";
import type { PumpBoy } from "../types/pump-boys.types";

export function usePumpBoys() {
  const [pumpBoys, setPumpBoys] = useState<PumpBoy[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getPumpBoys()
      .then((data) => {
        if (isCurrent) setPumpBoys(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load pump boys.",
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
    pumpBoys,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
