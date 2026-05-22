export type CreateSaleDto = {
  shiftId: string;
  nozzleId: string;
  productId: string;
  customerId?: string;
  liters: string;
  rate: string;
  paymentMethod?: "CASH" | "UPI" | "CARD" | "CREDIT" | "FLEET_CARD";
  paymentReference?: string;
};
