import { useEffect, useState } from "react";
import { getTanks } from "../api/tanks.api";
import type { Tank } from "../types/tanks.types";

export function useTanks() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getTanks()
      .then((data) => {
        if (isCurrent) setTanks(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load tanks.",
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
    tanks,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
