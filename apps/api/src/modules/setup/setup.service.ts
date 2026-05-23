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
  type TankSetupInput,
} from "./setup.dto.js";

type NormalizedTank = {
  productType: ProductType;
  capacity: string;
  currentDip: string;
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
      requiresSetup: !user.station,
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

    const station = await prisma.$transaction(async (transaction) => {
      return transaction.station.create({
        data: {
          name: stationName,
          code: stationCode,
          address: this.optionalText(input.address),
          organization: {
            create: {
              name: organizationName,
              gstin: this.optionalText(input.gstin),
            },
          },
          users: {
            connect: { id: userId },
          },
          tanks: {
            create: tanks.map((tank) => ({
              productType: tank.productType,
              capacity: tank.capacity,
              currentDip: tank.currentDip,
            })),
          },
        },
        include: {
          organization: true,
          tanks: {
                        orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    return {
      requiresSetup: false,
      station,
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
}
