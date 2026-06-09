import { apiRequest } from "../../../lib/api-client";
import type { Tank, TankNozzle } from "../types/tanks.types";

export function getTanks() {
  return apiRequest<Tank[]>("/api/tanks");
}

export function createTank(input: {
  productType: string;
  capacity: string;
  currentDip?: string;
}) {
  return apiRequest<Tank>("/api/tanks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteTank(id: string) {
  return apiRequest<{ deleted: boolean }>(`/api/tanks/${id}`, {
    method: "DELETE",
  });
}

export function updateTankDip(id: string, currentDip: string) {
  return apiRequest<Tank>(`/api/tanks/${id}/dip`, {
    method: "PATCH",
    body: JSON.stringify({ currentDip }),
  });
}

export function addDispenserToTank(
  tankId: string,
  input: { companyName: string; serialNo?: string },
) {
  return apiRequest<{ id: string; companyName: string; serialNo: string | null }>(`/api/tanks/${tankId}/dispensers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteDispenser(id: string) {
  return apiRequest<{ deleted: boolean }>(`/api/dispensers/${id}`, {
    method: "DELETE",
  });
}

export function addNozzle(
  dispenserId: string,
  input: { nozzleNumber: number; productType: string; tankId: string },
) {
  return apiRequest<TankNozzle>(`/api/dispensers/${dispenserId}/nozzles`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteNozzle(dispenserId: string, nozzleId: string) {
  return apiRequest<{ deleted: boolean }>(
    `/api/dispensers/${dispenserId}/nozzles/${nozzleId}`,
    { method: "DELETE" },
  );
}
