export type CreditCustomer = {
  id: string;
  stationId: string;
  name: string;
  phone: string | null;
  vehicleNo: string | null;
  creditLimit: string;
  isActive: boolean;
  _count: { sales: number };
  sales: { amount: string }[];
};
