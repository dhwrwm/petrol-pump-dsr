export type Tank = {
  id: string;
  stationId: string;
  productId: string;
  name: string;
  capacity: string;
  currentDip: string;
  product: {
    id: string;
    grade: string;
    name: string;
    unit: string;
  };
};
