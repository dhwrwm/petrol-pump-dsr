export type CreateEmployeeDto = {
  name: string;
  phone?: string;
  designation: string;
  joinedAt: string;
  salary: number;
};

export type UpdateEmployeeDto = {
  name?: string;
  phone?: string;
  designation?: string;
  joinedAt?: string;
  resignedAt?: string | null;
  salary?: number;
  isActive?: boolean;
};

export type AddDocumentDto = {
  type: "AADHAR" | "PAN" | "DRIVING_LICENSE" | "OTHER";
  url: string;
  fileName?: string;
};

export type AddSalaryRecordDto = {
  month: string;
  paid: number;
  advance?: number;
  deductions?: number;
  note?: string;
};
