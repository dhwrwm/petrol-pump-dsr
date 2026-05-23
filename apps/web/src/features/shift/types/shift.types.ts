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
  productId: string;
  customerId: string | null;
  liters: string;
  rate: string;
  amount: string;
  soldAt: string;
  product: { id: string; grade: string; name: string; unit: string };
  nozzle: { id: string; label: string };
  customer: { id: string; name: string } | null;
  payments: SalePayment[];
};

export type TankSummary = {
  name: string;
  fuel: string;
  level: number;
  stock: string;
};
