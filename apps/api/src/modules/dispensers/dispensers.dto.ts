import type { ProductType } from "../../generated/prisma/index.js";

export type NozzleInput = {
  productType: ProductType;
  openingMeterReading: string;
  date?: string;
};

export type CreateDispenserDto = {
  companyName: string;
  serialNo?: string;
  nozzles: NozzleInput[];
};
