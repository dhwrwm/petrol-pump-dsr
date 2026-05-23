import { useEffect, useState } from "react";
import { getDispensers } from "../api/settings.api";
import type { DispenserView } from "../types/settings.types";

export function useDispensers() {
  const [dispensers, setDispensers] = useState<DispenserView[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getDispensers()
      .then((data) => {
        if (isCurrent) setDispensers(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load dispensers.",
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
    dispensers,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
