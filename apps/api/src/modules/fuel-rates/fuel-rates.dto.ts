import type { ProductType } from "../../generated/prisma/index.js";

export type FuelRateInput = {
  productType: ProductType;
  rate: string;
};

export type SetTodayRatesDto = {
  rates: FuelRateInput[];
};
