import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import type { AddNozzleDto, CreateDispenserDto } from "./dispensers.dto.js";

@Injectable()
export class DispensersService {
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

    return prisma.dispenser.findMany({
      where: { stationId },
      include: {
        nozzles: {
          include: { calibrationRenewals: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(userId: string, input: CreateDispenserDto) {
    const stationId = await this.getStationId(userId);

    if (!input.companyName.trim()) {
      throw new BadRequestException("Dispenser company name is required.");
    }

    if (!input.nozzles.length) {
      throw new BadRequestException(
        "At least one nozzle is required per dispenser.",
      );
    }

    return prisma.$transaction(async (tx) => {
      const dispenser = await tx.dispenser.create({
        data: {
          stationId,
          companyName: input.companyName.trim(),
          serialNo: input.serialNo?.trim() || null,
        },
      });

      await Promise.all(
        input.nozzles.map((n) =>
          tx.nozzle.create({
            data: {
              dispenserId: dispenser.id,
              nozzleNumber: n.nozzleNumber,
              productType: n.productType,
              tankId: n.tankId,
            },
          }),
        ),
      );

      return tx.dispenser.findUnique({
        where: { id: dispenser.id },
        include: {
          nozzles: {
            include: { calibrationRenewals: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });
  }

  async addNozzle(userId: string, dispenserId: string, input: AddNozzleDto) {
    const stationId = await this.getStationId(userId);
    const dispenser = await prisma.dispenser.findUnique({
      where: { id: dispenserId },
      select: { stationId: true },
    });
    if (!dispenser || dispenser.stationId !== stationId) {
      throw new NotFoundException("Dispenser not found.");
    }

    return prisma.nozzle.create({
      data: {
        dispenserId,
        nozzleNumber: input.nozzleNumber,
        productType: input.productType,
        tankId: input.tankId,
      },
    });
  }

  async deleteNozzle(userId: string, dispenserId: string, nozzleId: string) {
    const stationId = await this.getStationId(userId);
    const dispenser = await prisma.dispenser.findUnique({
      where: { id: dispenserId },
      select: { stationId: true },
    });
    if (!dispenser || dispenser.stationId !== stationId) {
      throw new NotFoundException("Dispenser not found.");
    }
    await prisma.nozzle.delete({ where: { id: nozzleId } });
    return { deleted: true };
  }

  async delete(userId: string, dispenserId: string) {
    const stationId = await this.getStationId(userId);

    const dispenser = await prisma.dispenser.findUnique({
      where: { id: dispenserId },
      select: { stationId: true },
    });

    if (!dispenser || dispenser.stationId !== stationId) {
      throw new NotFoundException("Dispenser not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.nozzle.deleteMany({ where: { dispenserId } });
      await tx.dispenser.delete({ where: { id: dispenserId } });
    });

    return { deleted: true };
  }
}
