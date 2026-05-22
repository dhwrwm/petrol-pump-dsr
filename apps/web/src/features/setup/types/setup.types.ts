export type FuelGrade = "PETROL" | "DIESEL" | "PREMIUM_PETROL" | "CNG";

export type StationTank = {
  id: string;
  name: string;
  capacity: string;
  currentDip: string;
  product: {
    id: string;
    grade: FuelGrade;
    name: string;
  };
};

export type StationSetup = {
  id: string;
  name: string;
  code: string;
  address: string | null;
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

export type TankSetupInput = {
  name: string;
  grade: FuelGrade;
  capacity: string;
  currentDip: string;
};

export type CreateStationSetupInput = {
  organizationName: string;
  gstin?: string;
  stationName: string;
  stationCode: string;
  address?: string;
  tanks: TankSetupInput[];
};
