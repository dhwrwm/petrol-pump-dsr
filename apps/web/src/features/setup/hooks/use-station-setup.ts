import { useEffect, useState } from "react";
import { getStationSetup } from "../api/setup.api";
import { type StationSetupState } from "../types/setup.types";

export function useStationSetup(enabled: boolean) {
  const [state, setState] = useState<StationSetupState | null>(null);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setState(null);
      setError("");
      setIsPending(false);
      return;
    }

    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getStationSetup()
      .then((nextState) => {
        if (isCurrent) {
          setState(nextState);
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load station setup.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsPending(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [enabled, reloadToken]);

  return {
    error,
    isPending,
    state,
    refetch: () => setReloadToken((token) => token + 1),
    setState,
  };
}
