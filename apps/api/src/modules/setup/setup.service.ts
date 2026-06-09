import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductType } from "../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import {
  type CreateStationSetupDto,
  type DispenserSetupInput,
  type NozzleSetupInput,
  type TankSetupInput,
  type UpdateStationSettingsDto,
} from "./setup.dto.js";

type NormalizedTank = {
  productType: ProductType;
  capacity: string;
  currentDip: string;
};

type NormalizedDispenser = {
  companyName: string;
  serialNo?: string;
};

type NormalizedNozzle = {
  nozzleNumber: number;
  productType: ProductType;
  tankIndex: number;
  dispenserIndex: number;
};

@Injectable()
export class SetupService {
  async getStationSetup(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stationId: true,
        station: {
          include: {
            organization: true,
            tanks: {
              include: {
                nozzles: {
                  include: { dispenser: true },
                  orderBy: { nozzleNumber: "asc" },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return {
      requiresSetup: !user.station || !user.station.setupComplete,
      station: user.station,
    };
  }

  async createStationSetup(userId: string, input: CreateStationSetupDto) {
    const organizationName = this.requiredText(
      input.organizationName,
      "Organization name",
    );
    const stationName = this.requiredText(input.stationName, "Station name");
    const stationCode = this.requiredText(input.stationCode, "Station code")
      .toUpperCase()
      .replaceAll(" ", "-");
    const tanks = this.normalizeTanks(input.tanks);
    const dispensers = this.normalizeDispensers(input.dispensers);
    const nozzles = this.normalizeNozzles(
      input.nozzles,
      tanks.length,
      dispensers.length,
    );

    const setupState = await this.getStationSetup(userId);

    if (setupState.station) {
      throw new ConflictException("This user already has a station.");
    }

    const existingStation = await prisma.station.findUnique({
      where: { code: stationCode },
      select: { id: true },
    });

    if (existingStation) {
      throw new ConflictException("Station code is already in use.");
    }

    const result = await prisma.$transaction(async (transaction) => {
      // 1. Create station with organization
      const station = await transaction.station.create({
        data: {
          name: stationName,
          code: stationCode,
          address: this.optionalText(input.address),
          setupComplete: true,
          organization: {
            create: {
              name: organizationName,
              gstin: this.optionalText(input.gstin),
            },
          },
          users: {
            connect: { id: userId },
          },
        },
      });

      // 2. Create tanks one by one to preserve order
      const createdTanks = [];
      for (const tank of tanks) {
        const createdTank = await transaction.tank.create({
          data: {
            stationId: station.id,
            productType: tank.productType,
            capacity: tank.capacity,
            currentDip: tank.currentDip,
          },
        });
        createdTanks.push(createdTank);
      }

      // 3. Create dispensers one by one to preserve order
      const createdDispensers = [];
      for (const dispenser of dispensers) {
        const createdDispenser = await transaction.dispenser.create({
          data: {
            stationId: station.id,
            companyName: dispenser.companyName,
            serialNo: dispenser.serialNo,
          },
        });
        createdDispensers.push(createdDispenser);
      }

      // 4. Create nozzles using index mapping
      for (const nozzle of nozzles) {
        const tank = createdTanks[nozzle.tankIndex];
        const dispenser = createdDispensers[nozzle.dispenserIndex];
        await transaction.nozzle.create({
          data: {
            nozzleNumber: nozzle.nozzleNumber,
            productType: nozzle.productType,
            tankId: tank.id,
            dispenserId: dispenser.id,
          },
        });
      }

      return { station, tanks: createdTanks };
    });

    return {
      requiresSetup: false,
      station: { ...result.station, tanks: result.tanks },
    };
  }

  private normalizeTanks(tanks: TankSetupInput[] | undefined): NormalizedTank[] {
    if (!Array.isArray(tanks) || tanks.length === 0) {
      throw new BadRequestException("Add at least one station tank.");
    }

    return tanks.map((tank, index): NormalizedTank => {
      const label = `Tank ${index + 1}`;
      const capacity = this.positiveDecimal(tank.capacity, `${label} capacity`);
      const currentDip = this.nonNegativeDecimal(
        tank.currentDip,
        `${label} opening dip`,
      );

      if (!Object.values(ProductType).includes(tank.productType)) {
        throw new BadRequestException(`${label} has an invalid product type.`);
      }

      if (Number(currentDip) > Number(capacity)) {
        throw new BadRequestException(
          `${label} opening dip cannot exceed capacity.`,
        );
      }

      return { productType: tank.productType, capacity, currentDip };
    });
  }

  private normalizeDispensers(
    dispensers: DispenserSetupInput[] | undefined,
  ): NormalizedDispenser[] {
    if (!dispensers || dispensers.length === 0) {
      return [];
    }

    return dispensers.map((dispenser, index): NormalizedDispenser => {
      const label = `Dispenser ${index + 1}`;
      const companyName = dispenser.companyName?.trim();

      if (!companyName) {
        throw new BadRequestException(`${label} company name is required.`);
      }

      return {
        companyName,
        serialNo: dispenser.serialNo?.trim() || undefined,
      };
    });
  }

  private normalizeNozzles(
    nozzles: NozzleSetupInput[] | undefined,
    tankCount: number,
    dispenserCount: number,
  ): NormalizedNozzle[] {
    if (!nozzles || nozzles.length === 0) {
      return [];
    }

    return nozzles.map((nozzle, index): NormalizedNozzle => {
      const label = `Nozzle ${index + 1}`;

      if (
        !Number.isInteger(nozzle.nozzleNumber) ||
        nozzle.nozzleNumber <= 0
      ) {
        throw new BadRequestException(
          `${label} nozzle number must be a positive integer.`,
        );
      }

      if (nozzle.tankIndex < 0 || nozzle.tankIndex >= tankCount) {
        throw new BadRequestException(
          `${label} has an invalid tank reference (index ${nozzle.tankIndex}).`,
        );
      }

      if (nozzle.dispenserIndex < 0 || nozzle.dispenserIndex >= dispenserCount) {
        throw new BadRequestException(
          `${label} has an invalid dispenser reference (index ${nozzle.dispenserIndex}).`,
        );
      }

      if (!Object.values(ProductType).includes(nozzle.productType)) {
        throw new BadRequestException(`${label} has an invalid product type.`);
      }

      return {
        nozzleNumber: nozzle.nozzleNumber,
        productType: nozzle.productType,
        tankIndex: nozzle.tankIndex,
        dispenserIndex: nozzle.dispenserIndex,
      };
    });
  }

  private requiredText(value: string | undefined, label: string) {
    const text = this.optionalText(value);

    if (!text) {
      throw new BadRequestException(`${label} is required.`);
    }

    return text;
  }

  private optionalText(value: string | undefined) {
    const text = value?.trim();
    return text ? text : undefined;
  }

  private positiveDecimal(value: string | undefined, label: string) {
    const decimal = this.decimal(value, label);

    if (Number(decimal) <= 0) {
      throw new BadRequestException(`${label} must be greater than zero.`);
    }

    return decimal;
  }

  private nonNegativeDecimal(value: string | undefined, label: string) {
    const decimal = this.decimal(value, label);

    if (Number(decimal) < 0) {
      throw new BadRequestException(`${label} cannot be negative.`);
    }

    return decimal;
  }

  private decimal(value: string | undefined, label: string) {
    const decimal = value?.trim();

    if (!decimal || !Number.isFinite(Number(decimal))) {
      throw new BadRequestException(`${label} must be a number.`);
    }

    return decimal;
  }

  async updateStationSettings(userId: string, input: UpdateStationSettingsDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });

    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    if (
      input.shiftsPerDay !== undefined &&
      (!Number.isInteger(input.shiftsPerDay) || input.shiftsPerDay < 1 || input.shiftsPerDay > 4)
    ) {
      throw new BadRequestException("Shifts per day must be between 1 and 4.");
    }

    return prisma.station.update({
      where: { id: user.stationId },
      data: {
        ...(input.shiftsPerDay !== undefined ? { shiftsPerDay: input.shiftsPerDay } : {}),
      },
      select: { id: true, name: true, code: true, shiftsPerDay: true },
    });
  }
}
