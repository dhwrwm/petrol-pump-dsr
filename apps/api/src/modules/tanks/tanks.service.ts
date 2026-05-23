import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Decimal } from "../../generated/prisma/runtime/client.js";
import { FuelGrade, ProductType } from "../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import type { AddDispenserToTankDto, CreateTankDto } from "./tanks.dto.js";

const productTypeToGrade: Partial<Record<ProductType, FuelGrade>> = {
  MS: FuelGrade.PETROL,
  HSD: FuelGrade.DIESEL,
  XP95: FuelGrade.PREMIUM_PETROL,
};

const dispenserInclude = {
  nozzles: { orderBy: { createdAt: "asc" as const } },
} as const;

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

  private async assertTankBelongsToStation(tankId: string, stationId: string) {
    const tank = await prisma.tank.findUnique({
      where: { id: tankId },
      select: { stationId: true },
    });
    if (!tank || tank.stationId !== stationId) {
      throw new NotFoundException("Tank not found.");
    }
    return tank;
  }

  async list(userId: string) {
    const stationId = await this.getStationId(userId);
    return prisma.tank.findMany({
      where: { stationId },
      include: {
        dispensers: {
          include: dispenserInclude,
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(userId: string, input: CreateTankDto) {
    const stationId = await this.getStationId(userId);

    const capacity = new Decimal(input.capacity);
    if (capacity.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Capacity must be greater than zero.");
    }

    const currentDip = new Decimal(input.currentDip ?? "0");
    if (currentDip.isNegative()) {
      throw new BadRequestException("Opening dip cannot be negative.");
    }
    if (currentDip.greaterThan(capacity)) {
      throw new BadRequestException("Opening dip cannot exceed capacity.");
    }

    return prisma.tank.create({
      data: {
        stationId,
        productType: input.productType,
        capacity,
        currentDip,
      },
      include: {
        dispensers: { include: dispenserInclude },
      },
    });
  }

  async delete(userId: string, tankId: string) {
    const stationId = await this.getStationId(userId);
    await this.assertTankBelongsToStation(tankId, stationId);
    await prisma.tank.delete({ where: { id: tankId } });
    return { deleted: true };
  }

  async addDispenser(
    userId: string,
    tankId: string,
    input: AddDispenserToTankDto,
  ) {
    const stationId = await this.getStationId(userId);
    await this.assertTankBelongsToStation(tankId, stationId);

    if (!input.companyName.trim()) {
      throw new BadRequestException("Company name is required.");
    }

    return prisma.dispenser.create({
      data: {
        stationId,
        companyName: input.companyName.trim(),
        serialNo: input.serialNo?.trim() || null,
        tanks: { connect: { id: tankId } },
      },
      include: dispenserInclude,
    });
  }

  async updateDip(userId: string, tankId: string, newDip: string) {
    const stationId = await this.getStationId(userId);
    const tank = await prisma.tank.findUnique({ where: { id: tankId } });

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
        include: {
          dispensers: { include: dispenserInclude },
        },
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
