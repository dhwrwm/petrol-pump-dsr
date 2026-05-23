import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Decimal } from "../../generated/prisma/runtime/client.js";
import { FuelGrade, ProductType } from "../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";

const productTypeToGrade: Partial<Record<ProductType, FuelGrade>> = {
  MS: FuelGrade.PETROL,
  HSD: FuelGrade.DIESEL,
  XP95: FuelGrade.PREMIUM_PETROL,
};

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
      orderBy: { createdAt: "asc" },
    });
  }

  async updateDip(userId: string, tankId: string, newDip: string) {
    const stationId = await this.getStationId(userId);

    const tank = await prisma.tank.findUnique({
      where: { id: tankId },
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
      });

      const grade = productTypeToGrade[tank.productType];
      if (grade) {
        const product = await tx.product.findUnique({ where: { grade } });
        if (product) {
          await tx.inventoryMovement.create({
            data: {
              tankId,
              productId: product.id,
              type: "DIP_ADJUSTMENT",
              quantity: adjustment,
              note: "Manual dip adjustment",
            },
          });
        }
      }

      return updated;
    });
  }
}
