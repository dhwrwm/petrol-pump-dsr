export type ProductType = "MS" | "HSD" | "XP95" | "OTHERS";

export const PRODUCT_LABELS: Record<ProductType, string> = {
  MS: "Petrol (MS)",
  HSD: "Diesel (HSD)",
  XP95: "Premium (XP95)",
  OTHERS: "Other",
};

export type Nozzle = {
  id: string;
  dispenserId: string;
  productType: ProductType;
  openingMeterReading: string;
  closingMeterReading: string | null;
  nozzleTestingLiters: string;
  date: string;
  createdAt: string;
};

export type Dispenser = {
  id: string;
  stationId: string;
  companyName: string;
  serialNo: string | null;
  nozzles: Nozzle[];
  createdAt: string;
};

export type Tank = {
  id: string;
  stationId: string;
  productType: ProductType;
  capacity: string;
  currentDip: string;
  dispensers: Dispenser[];
  createdAt: string;
};
