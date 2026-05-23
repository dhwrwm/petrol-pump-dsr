export type DailyAggregate = {
  date: string;
  totalAmount: string;
  totalLiters: string;
  saleCount: number;
};

export type FuelGradeAggregate = {
  grade: string;
  productName: string;
  totalAmount: string;
  totalLiters: string;
  saleCount: number;
};

export type PaymentMethodAggregate = {
  method: string;
  totalAmount: string;
};

export type SalesSummary = {
  period: "week" | "month";
  startDate: string;
  endDate: string;
  totalRevenue: string;
  totalVolume: string;
  totalTransactions: number;
  avgDailyRevenue: string;
  dailyBreakdown: DailyAggregate[];
  byFuelGrade: FuelGradeAggregate[];
  byPaymentMethod: PaymentMethodAggregate[];
};
