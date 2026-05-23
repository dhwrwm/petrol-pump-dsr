export type DocumentType = "AADHAR" | "PAN" | "DRIVING_LICENSE" | "OTHER";

export type EmployeeDocument = {
  id: string;
  employeeId: string;
  type: DocumentType;
  url: string;
  fileName: string | null;
  createdAt: string;
};

export type SalaryRecord = {
  id: string;
  employeeId: string;
  month: string;
  paid: string;
  advance: string;
  deductions: string;
  note: string | null;
};

export type Employee = {
  id: string;
  stationId: string;
  name: string;
  phone: string | null;
  designation: string;
  joinedAt: string;
  resignedAt: string | null;
  salary: string;
  isActive: boolean;
  documents: EmployeeDocument[];
  salaryRecords: SalaryRecord[];
};
