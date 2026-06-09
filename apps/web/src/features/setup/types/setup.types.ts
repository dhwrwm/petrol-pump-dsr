export type ProductType = "MS" | "HSD" | "XP95" | "OTHERS";

export const PRODUCT_LABELS: Record<ProductType, string> = {
  MS: "Petrol (MS)",
  HSD: "Diesel (HSD)",
  XP95: "Premium (XP95)",
  OTHERS: "Other",
};

export type StationNozzle = {
  id: string;
  nozzleNumber: number;
  productType: ProductType;
  isActive: boolean;
};

export type StationTank = {
  id: string;
  productType: ProductType;
  capacity: string;
  currentDip: string;
  nozzles: StationNozzle[];
};

export type StationSetup = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  shiftsPerDay: number;
  setupComplete: boolean;
  organization: {
    id: string;
    name: string;
    gstin: string | null;
  };
  tanks: StationTank[];
};

export type StationSetupState = {
  requiresSetup: boolean;
  station: StationSetup | null;
};

// Form input types
export type TankSetupInput = {
  productType: ProductType;
  capacity: string;
  currentDip: string;
};

export type DispenserSetupInput = {
  companyName: string;
  serialNo: string;
};

export type NozzleSetupInput = {
  nozzleNumber: string;
  productType: ProductType;
  tankIndex: number;
  dispenserIndex: number;
};

export type CreateStationSetupInput = {
  organizationName: string;
  gstin?: string;
  stationName: string;
  stationCode: string;
  address?: string;
  tanks: TankSetupInput[];
  dispensers: DispenserSetupInput[];
  nozzles: Array<{
    nozzleNumber: number;
    productType: ProductType;
    tankIndex: number;
    dispenserIndex: number;
  }>;
};
