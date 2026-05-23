import { apiRequest } from "../../../lib/api-client";
import type { SalesSummary } from "../types/dashboard.types";

export function getSalesSummary(period: "week" | "month") {
  return apiRequest<SalesSummary>(`/api/sales/summary?period=${period}`);
}
