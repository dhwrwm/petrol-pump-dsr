import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Decimal } from "../../generated/prisma/runtime/client.js";
import { prisma } from "../../lib/prisma.js";

@Injectable()
export class TanksService {
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

  async list(userId: string) {
    const stationId = await this.getStationId(userId);

    return prisma.tank.findMany({
      where: { stationId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async updateDip(userId: string, tankId: string, newDip: string) {
    const stationId = await this.getStationId(userId);

    const tank = await prisma.tank.findUnique({
      where: { id: tankId },
      include: { product: true },
    });

    if (!tank || tank.stationId !== stationId) {
      throw new NotFoundException("Tank not found.");
    }

    const dipValue = new Decimal(newDip);

    if (dipValue.isNegative()) {
      throw new BadRequestException("Dip reading cannot be negative.");
    }

    if (dipValue.greaterThan(tank.capacity)) {
      throw new BadRequestException("Dip reading cannot exceed tank capacity.");
    }

    const adjustment = dipValue.minus(tank.currentDip);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.tank.update({
        where: { id: tankId },
        data: { currentDip: dipValue },
        include: { product: true },
      });

      await tx.inventoryMovement.create({
        data: {
          tankId,
          productId: tank.productId,
          type: "DIP_ADJUSTMENT",
          quantity: adjustment,
          note: "Manual dip adjustment",
        },
      });

      return updated;
    });
  }
}
