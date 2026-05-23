import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import { CreateSaleDto } from "./sales.dto.js";

@Injectable()
export class SalesService {
  async list(userId: string, shiftId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });

    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    return prisma.sale.findMany({
      where: {
        shift: { stationId: user.stationId },
        ...(shiftId ? { shiftId } : {}),
      },
      include: {
        product: true,
        nozzle: true,
        customer: true,
        payments: true,
      },
      orderBy: {
        soldAt: "desc",
      },
      take: 100,
    });
  }

  async create(input: CreateSaleDto) {
    const liters = input.liters;
    const rate = input.rate;
    const amount = (Number(liters) * Number(rate)).toFixed(2);

    return prisma.sale.create({
      data: {
        shiftId: input.shiftId,
        nozzleId: input.nozzleId,
        productId: input.productId,
        customerId: input.customerId,
        liters,
        rate,
        amount,
        payments: input.paymentMethod
          ? {
              create: {
                shiftId: input.shiftId,
                method: input.paymentMethod,
                amount,
                reference: input.paymentReference,
              },
            }
          : undefined,
      },
      include: {
        payments: true,
      },
    });
  }
}
