import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import type { CreatePumpBoyDto, UpdatePumpBoyDto } from "./pump-boys.dto.js";

@Injectable()
export class PumpBoysService {
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

    return prisma.pumpBoy.findMany({
      where: { stationId },
      orderBy: { name: "asc" },
    });
  }

  async create(userId: string, input: CreatePumpBoyDto) {
    const stationId = await this.getStationId(userId);

    if (!input.name.trim()) {
      throw new BadRequestException("Pump boy name is required.");
    }

    return prisma.pumpBoy.create({
      data: {
        stationId,
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
      },
    });
  }

  async update(userId: string, pumpBoyId: string, input: UpdatePumpBoyDto) {
    const stationId = await this.getStationId(userId);

    const pumpBoy = await prisma.pumpBoy.findUnique({
      where: { id: pumpBoyId },
      select: { stationId: true },
    });

    if (!pumpBoy || pumpBoy.stationId !== stationId) {
      throw new NotFoundException("Pump boy not found.");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestException("Pump boy name is required.");
    }

    return prisma.pumpBoy.update({
      where: { id: pumpBoyId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.phone !== undefined && {
          phone: input.phone.trim() || null,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  async delete(userId: string, pumpBoyId: string) {
    const stationId = await this.getStationId(userId);

    const pumpBoy = await prisma.pumpBoy.findUnique({
      where: { id: pumpBoyId },
      select: { stationId: true },
    });

    if (!pumpBoy || pumpBoy.stationId !== stationId) {
      throw new NotFoundException("Pump boy not found.");
    }

    const hasAssignments = await prisma.nozzleAssignment.findFirst({
      where: { pumpBoyId },
      select: { id: true },
    });

    if (hasAssignments) {
      throw new BadRequestException(
        "Cannot delete a pump boy with existing nozzle assignments.",
      );
    }

    await prisma.pumpBoy.delete({ where: { id: pumpBoyId } });

    return { deleted: true };
  }
}
