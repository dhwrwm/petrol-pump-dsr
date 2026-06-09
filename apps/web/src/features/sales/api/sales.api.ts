import { apiRequest } from "../../../lib/api-client";
import type { CurrentShift, Sale } from "../../shift/types/shift.types";

export function getSales() {
  return apiRequest<Sale[]>("/api/sales");
}

export type CreateSaleInput = {
  nozzleId: string;
  openingMeter: string;
  closingMeter: string;
  rate: string;
  payments: Array<{
    method: "CASH" | "UPI" | "CARD" | "CREDIT" | "FLEET_CARD";
    amount: string;
    reference?: string;
  }>;
};

export function createSale(input: CreateSaleInput) {
  return apiRequest<Sale>("/api/sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getNozzleMeter(nozzleId: string) {
  return apiRequest<{ lastClosingMeter: string }>(
    `/api/sales/nozzle-meter?nozzleId=${encodeURIComponent(nozzleId)}`,
  );
}

export function getCurrentShift() {
  return apiRequest<CurrentShift | null>("/api/sales/current-shift");
}

export type UpdateSaleInput = {
  closingMeter: string;
  payments: Array<{
    method: "CASH" | "UPI" | "CARD" | "CREDIT" | "FLEET_CARD";
    amount: string;
    reference?: string;
  }>;
};

export function updateSale(saleId: string, input: UpdateSaleInput) {
  return apiRequest<Sale>(`/api/sales/${encodeURIComponent(saleId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
