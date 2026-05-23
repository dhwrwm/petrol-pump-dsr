import { apiRequest } from "../../../lib/api-client";
import type { Employee, EmployeeDocument, SalaryRecord } from "../types/employees.types";

export function getEmployees() {
  return apiRequest<Employee[]>("/api/employees");
}

export function createEmployee(input: {
  name: string;
  phone?: string;
  designation: string;
  joinedAt: string;
  salary: number;
}) {
  return apiRequest<Employee>("/api/employees", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEmployee(
  id: string,
  input: {
    name?: string;
    phone?: string;
    designation?: string;
    joinedAt?: string;
    resignedAt?: string | null;
    salary?: number;
    isActive?: boolean;
  },
) {
  return apiRequest<Employee>(`/api/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteEmployee(id: string) {
  return apiRequest<{ deleted: boolean }>(`/api/employees/${id}`, {
    method: "DELETE",
  });
}

export function addEmployeeDocument(
  id: string,
  input: { type: string; url: string; fileName?: string },
) {
  return apiRequest<EmployeeDocument>(`/api/employees/${id}/documents`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteEmployeeDocument(id: string, docId: string) {
  return apiRequest<{ deleted: boolean }>(
    `/api/employees/${id}/documents/${docId}`,
    { method: "DELETE" },
  );
}

export function addSalaryRecord(
  id: string,
  input: {
    month: string;
    paid: number;
    advance?: number;
    deductions?: number;
    note?: string;
  },
) {
  return apiRequest<SalaryRecord>(`/api/employees/${id}/salary`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
