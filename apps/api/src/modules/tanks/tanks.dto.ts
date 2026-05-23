import type { ProductType } from "../../generated/prisma/index.js";

export type CreateTankDto = {
  productType: ProductType;
  capacity: string;
  currentDip?: string;
};

export type AddDispenserToTankDto = {
  companyName: string;
  serialNo?: string;
};
