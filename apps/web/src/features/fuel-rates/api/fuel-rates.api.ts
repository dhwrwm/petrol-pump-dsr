import { apiRequest } from "../../../lib/api-client";
import type { FuelRate } from "../types/fuel-rates.types";

export function getTodayRates() {
  return apiRequest<FuelRate[]>("/api/fuel-rates/today");
}

export function setTodayRates(rates: FuelRate[]) {
  return apiRequest<FuelRate[]>("/api/fuel-rates/today", {
    method: "POST",
    body: JSON.stringify({ rates }),
  });
}
