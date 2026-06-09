import type { ProductType } from "../../generated/prisma/index.js";

export type TankSetupInput = {
  productType: ProductType;
  capacity: string;
  currentDip: string;
};

export type DispenserSetupInput = {
  companyName: string;
  serialNo?: string;
};

export type NozzleSetupInput = {
  nozzleNumber: number;
  productType: ProductType;
  tankIndex: number;      // 0-based index into tanks array
  dispenserIndex: number; // 0-based index into dispensers array
};

export type CreateStationSetupDto = {
  organizationName: string;
  gstin?: string;
  stationName: string;
  stationCode: string;
  address?: string;
  tanks: TankSetupInput[];
  dispensers?: DispenserSetupInput[];
  nozzles?: NozzleSetupInput[];
};

export type UpdateStationSettingsDto = {
  shiftsPerDay?: number;
};
