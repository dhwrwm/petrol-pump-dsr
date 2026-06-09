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
  tankId: string;
  nozzleNumber: number;
  productType: ProductType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DispenserBase = {
  id: string;
  stationId: string;
  companyName: string;
  serialNo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TankNozzle = Nozzle & { dispenser: DispenserBase };

export type Tank = {
  id: string;
  stationId: string;
  productType: ProductType;
  capacity: string;
  currentDip: string;
  nozzles: TankNozzle[];
  createdAt: string;
};
