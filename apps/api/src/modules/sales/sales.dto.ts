export type PaymentInput = {
  method: "CASH" | "UPI" | "CARD" | "CREDIT" | "FLEET_CARD";
  amount: string;
  reference?: string;
};

export type CreateSaleDto = {
  nozzleId: string;
  openingMeter: string;
  closingMeter: string;
  rate: string;
  payments: PaymentInput[];
};

export type UpdateSaleDto = {
  closingMeter: string;
  payments: PaymentInput[];
};
