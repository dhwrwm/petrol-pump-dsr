export type CreatePumpBoyDto = {
  name: string;
  phone?: string;
};

export type UpdatePumpBoyDto = {
  name?: string;
  phone?: string;
  isActive?: boolean;
};
