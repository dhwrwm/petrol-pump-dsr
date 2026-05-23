import { apiRequest } from "../../../lib/api-client";
import {
  type CreateStationSetupInput,
  type StationSetupState,
} from "../types/setup.types";

export function getStationSetup() {
  return apiRequest<StationSetupState>("/api/setup/station");
}

export function createStationSetup(input: CreateStationSetupInput) {
  return apiRequest<StationSetupState>("/api/setup/station", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
