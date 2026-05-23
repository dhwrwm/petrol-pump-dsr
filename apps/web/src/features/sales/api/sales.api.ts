import { apiRequest } from "../../../lib/api-client";
import type { Sale } from "../../shift/types/shift.types";

export function getSales() {
  return apiRequest<Sale[]>("/api/sales");
}
