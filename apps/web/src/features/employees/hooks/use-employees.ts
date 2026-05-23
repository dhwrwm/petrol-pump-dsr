import { useEffect, useState } from "react";
import { getEmployees } from "../api/employees.api";
import type { Employee } from "../types/employees.types";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsPending(true);
    setError("");
    void getEmployees()
      .then((data) => {
        if (isCurrent) setEmployees(data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load employees.",
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
    employees,
    error,
    isPending,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
