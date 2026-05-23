import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";

@Injectable()
export class CreditService {
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
