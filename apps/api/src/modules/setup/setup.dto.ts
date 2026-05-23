import type { ProductType } from "../../generated/prisma/index.js";

export type TankSetupInput = {
  productType: ProductType;
  capacity: string;
  currentDip: string;
};

export type CreateStationSetupDto = {
  organizationName: string;
  gstin?: string;
  stationName: string;
  stationCode: string;
  address?: string;
  tanks: TankSetupInput[];
};
