import { FuelGrade } from "../../generated/prisma/index.js";

export type TankSetupInput = {
  name: string;
  grade: FuelGrade;
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
