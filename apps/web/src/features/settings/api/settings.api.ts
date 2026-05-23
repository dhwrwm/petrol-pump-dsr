import { apiRequest } from "../../../lib/api-client";
import type { CreateDispenserInput, DispenserView } from "../types/settings.types";
import type { Tank } from "../../tanks/types/tanks.types";

export function getDispensers() {
  return apiRequest<DispenserView[]>("/api/dispensers");
}

export function createDispenser(input: CreateDispenserInput) {
  return apiRequest<DispenserView>("/api/dispensers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteDispenser(id: string) {
  return apiRequest<{ deleted: boolean }>(`/api/dispensers/${id}`, {
    method: "DELETE",
  });
}

export function updateTankDip(tankId: string, currentDip: string) {
  return apiRequest<Tank>(`/api/tanks/${tankId}/dip`, {
    method: "PATCH",
    body: JSON.stringify({ currentDip }),
  });
}
