export type SalePayment = {
  id: string;
  method: string;
  amount: string;
  reference: string | null;
};

export type Sale = {
  id: string;
  shiftId: string;
  nozzleId: string;
  productType: string;
  customerId: string | null;
  employeeId: string | null;
  liters: string;
  rate: string;
  amount: string;
  soldAt: string;
  nozzle: { id: string; nozzleNumber: number; productType: string };
  customer: { id: string; name: string } | null;
  employee: { id: string; name: string } | null;
  payments: SalePayment[];
  meterReading: { openingMeter: string; closingMeter: string | null };
};

export type CurrentShift = {
  id: string;
  openedAt: string;
  shiftNumber: number;
};

export type TankSummary = {
  name: string;
  fuel: string;
  level: number;
  stock: string;
};
