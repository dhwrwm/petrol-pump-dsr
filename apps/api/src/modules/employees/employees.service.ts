import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import type {
  AddDocumentDto,
  AddSalaryRecordDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "./employees.dto.js";

@Injectable()
export class EmployeesService {
  private async getStationId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });
    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }
    return user.stationId;
  }

  private async assertEmployeeBelongsToStation(
    employeeId: string,
    stationId: string,
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { stationId: true },
    });
    if (!employee || employee.stationId !== stationId) {
      throw new NotFoundException("Employee not found.");
    }
  }

  async findOne(userId: string, employeeId: string) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    return prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        documents: { orderBy: { createdAt: "desc" } },
        salaryRecords: { orderBy: { month: "desc" } },
      },
    });
  }

  async list(userId: string) {
    const stationId = await this.getStationId(userId);
    return prisma.employee.findMany({
      where: { stationId },
      include: {
        documents: { orderBy: { createdAt: "desc" } },
        salaryRecords: { orderBy: { month: "desc" } },
      },
      orderBy: { name: "asc" },
    });
  }

  async create(userId: string, input: CreateEmployeeDto) {
    const stationId = await this.getStationId(userId);

    if (!input.name.trim()) throw new BadRequestException("Name is required.");
    if (!input.designation.trim())
      throw new BadRequestException("Designation is required.");

    return prisma.employee.create({
      data: {
        stationId,
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        designation: input.designation.trim(),
        joinedAt: new Date(input.joinedAt),
        salary: input.salary,
      },
    });
  }

  async update(userId: string, employeeId: string, input: UpdateEmployeeDto) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestException("Name is required.");
    }

    return prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.phone !== undefined && {
          phone: input.phone.trim() || null,
        }),
        ...(input.designation !== undefined && {
          designation: input.designation.trim(),
        }),
        ...(input.joinedAt !== undefined && {
          joinedAt: new Date(input.joinedAt),
        }),
        ...(input.resignedAt !== undefined && {
          resignedAt: input.resignedAt ? new Date(input.resignedAt) : null,
        }),
        ...(input.salary !== undefined && { salary: input.salary }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  async delete(userId: string, employeeId: string) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    const hasAssignments = await prisma.nozzleAssignment.findFirst({
      where: { employeeId },
      select: { id: true },
    });
    if (hasAssignments) {
      throw new BadRequestException(
        "Cannot delete an employee with existing nozzle assignments.",
      );
    }

    await prisma.employee.delete({ where: { id: employeeId } });
    return { deleted: true };
  }

  async addDocument(
    userId: string,
    employeeId: string,
    input: AddDocumentDto,
  ) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    return prisma.employeeDocument.create({
      data: {
        employeeId,
        type: input.type,
        url: input.url.trim(),
        fileName: input.fileName?.trim() || null,
      },
    });
  }

  async deleteDocument(userId: string, employeeId: string, docId: string) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    await prisma.employeeDocument.delete({ where: { id: docId } });
    return { deleted: true };
  }

  async addSalaryRecord(
    userId: string,
    employeeId: string,
    input: AddSalaryRecordDto,
  ) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    const month = new Date(input.month);
    month.setDate(1);
    month.setHours(0, 0, 0, 0);

    return prisma.salaryRecord.upsert({
      where: { employeeId_month: { employeeId, month } },
      create: {
        employeeId,
        month,
        paid: input.paid,
        advance: input.advance ?? 0,
        deductions: input.deductions ?? 0,
        note: input.note?.trim() || null,
      },
      update: {
        paid: input.paid,
        advance: input.advance ?? 0,
        deductions: input.deductions ?? 0,
        note: input.note?.trim() || null,
      },
    });
  }

  async listSalaryRecords(userId: string, employeeId: string) {
    const stationId = await this.getStationId(userId);
    await this.assertEmployeeBelongsToStation(employeeId, stationId);

    return prisma.salaryRecord.findMany({
      where: { employeeId },
      orderBy: { month: "desc" },
    });
  }
}
