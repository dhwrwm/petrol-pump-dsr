import type { ProductType } from "../../generated/prisma/index.js";

export type NozzleInput = {
  nozzleNumber: number;
  productType: ProductType;
  tankId: string;
};

export type CreateDispenserDto = {
  companyName: string;
  serialNo?: string;
  nozzles: NozzleInput[];
};

export type AddNozzleDto = {
  nozzleNumber: number;
  productType: ProductType;
  tankId: string;
};
