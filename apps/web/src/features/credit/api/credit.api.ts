import { apiRequest } from "../../../lib/api-client";
import type { CreditCustomer } from "../types/credit.types";

export function getCreditCustomers() {
  return apiRequest<CreditCustomer[]>("/api/credit");
}

export function createCreditCustomer(input: {
  name: string;
  phone?: string;
  vehicleNo?: string;
  creditLimit?: string;
}) {
  return apiRequest<CreditCustomer>("/api/credit", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
