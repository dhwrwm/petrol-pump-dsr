import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import type { CreateDispenserDto } from "./dispensers.dto.js";

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
          include: {
            tank: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(userId: string, input: CreateDispenserDto) {
    const stationId = await this.getStationId(userId);

    if (!input.name.trim()) {
      throw new BadRequestException("Dispenser name is required.");
    }

    if (!input.nozzles.length) {
      throw new BadRequestException(
        "At least one nozzle is required per dispenser.",
      );
    }

    for (const nozzle of input.nozzles) {
      if (!nozzle.label.trim()) {
        throw new BadRequestException("Each nozzle must have a label.");
      }
    }

    const tankIds = input.nozzles.map((n) => n.tankId);
    const tanks = await prisma.tank.findMany({
      where: { id: { in: tankIds }, stationId },
      select: { id: true },
    });

    const validTankIds = new Set(tanks.map((t) => t.id));
    for (const tankId of tankIds) {
      if (!validTankIds.has(tankId)) {
        throw new BadRequestException(
          `Tank ${tankId} does not belong to this station.`,
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const dispenser = await tx.dispenser.create({
        data: {
          stationId,
          name: input.name.trim(),
          serialNo: input.serialNo?.trim() || null,
          nozzles: {
            create: input.nozzles.map((n) => ({
              label: n.label.trim(),
              tankId: n.tankId,
            })),
          },
        },
        include: {
          nozzles: {
            include: {
              tank: {
                include: { product: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return dispenser;
    });
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

    const usedNozzles = await prisma.nozzle.findFirst({
      where: {
        dispenserId,
        OR: [
          { sales: { some: {} } },
          { readings: { some: {} } },
        ],
      },
      select: { id: true },
    });

    if (usedNozzles) {
      throw new BadRequestException(
        "Cannot delete a dispenser with nozzles that have recorded sales or readings.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.nozzle.deleteMany({ where: { dispenserId } });
      await tx.dispenser.delete({ where: { id: dispenserId } });
    });

    return { deleted: true };
  }
}
