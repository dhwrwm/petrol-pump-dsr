import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";

@Injectable()
export class CreditService {
  async create(
    userId: string,
    input: { name: string; phone?: string; vehicleNo?: string; creditLimit?: string },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });
    if (!user?.stationId) throw new NotFoundException("No station assigned to this user.");

    return prisma.creditCustomer.create({
      data: {
        stationId: user.stationId,
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        vehicleNo: input.vehicleNo?.trim() || null,
        creditLimit: input.creditLimit ? Number(input.creditLimit) : 0,
      },
    });
  }

  async list(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });

    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    return prisma.creditCustomer.findMany({
      where: { stationId: user.stationId },
      include: {
        _count: {
          select: { sales: true },
        },
        sales: {
          select: { amount: true },
          orderBy: { soldAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
