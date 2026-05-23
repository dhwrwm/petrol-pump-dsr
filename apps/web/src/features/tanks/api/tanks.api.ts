import { apiRequest } from "../../../lib/api-client";
import type { Tank } from "../types/tanks.types";

export function getTanks() {
  return apiRequest<Tank[]>("/api/tanks");
}
