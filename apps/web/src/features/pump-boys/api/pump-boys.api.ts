import { apiRequest } from "../../../lib/api-client";
import type { PumpBoy } from "../types/pump-boys.types";

export function getPumpBoys() {
  return apiRequest<PumpBoy[]>("/api/pump-boys");
}

export function createPumpBoy(input: { name: string; phone?: string }) {
  return apiRequest<PumpBoy>("/api/pump-boys", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePumpBoy(
  id: string,
  input: { name?: string; phone?: string; isActive?: boolean },
) {
  return apiRequest<PumpBoy>(`/api/pump-boys/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePumpBoy(id: string) {
  return apiRequest<{ deleted: boolean }>(`/api/pump-boys/${id}`, {
    method: "DELETE",
  });
}
