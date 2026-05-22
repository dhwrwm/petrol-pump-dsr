import {
  type CreateStationSetupInput,
  type StationSetupState,
} from "../types/setup.types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function stationSetupRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(" ")
      : body?.message;

    throw new Error(message ?? "Station setup request failed.");
  }

  return (await response.json()) as T;
}

export function getStationSetup() {
  return stationSetupRequest<StationSetupState>("/api/setup/station");
}

export function createStationSetup(input: CreateStationSetupInput) {
  return stationSetupRequest<StationSetupState>("/api/setup/station", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
