export type NozzleView = {
  id: string;
  label: string;
  openingMeter: string;
  tank: {
    id: string;
    name: string;
    product: { name: string };
  };
};

export type DispenserView = {
  id: string;
  name: string;
  serialNo: string | null;
  nozzles: NozzleView[];
};

export type NozzleInput = {
  label: string;
  tankId: string;
};

export type CreateDispenserInput = {
  name: string;
  serialNo?: string;
  nozzles: NozzleInput[];
};
