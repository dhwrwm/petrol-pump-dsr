import { useEffect, useState } from "react";
import { getEmployee } from "../api/employees.api";
import type { Employee } from "../types/employees.types";

export function useEmployee(id: string) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getEmployee(id)
      .then((data) => {
        if (isCurrent) setEmployee(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load employee.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsPending(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id, reloadToken]);

  return {
    employee,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
