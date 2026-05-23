export type NozzleInput = {
  label: string;
  tankId: string;
};

export type CreateDispenserDto = {
  name: string;
  serialNo?: string;
  nozzles: NozzleInput[];
};
