import { apiRequest } from "../../../lib/api-client";
import type { CreditCustomer } from "../types/credit.types";

export function getCreditCustomers() {
  return apiRequest<CreditCustomer[]>("/api/credit");
}
