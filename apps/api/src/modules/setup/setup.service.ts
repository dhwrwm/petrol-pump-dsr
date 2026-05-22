import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FuelGrade } from "../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import {
  type CreateStationSetupDto,
  type TankSetupInput,
} from "./setup.dto.js";

const productNames: Record<FuelGrade, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  PREMIUM_PETROL: "Premium petrol",
  CNG: "CNG",
};

type NormalizedTank = TankSetupInput & {
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
        station: {
          include: {
            organization: true,
            tanks: {
              include: {
                product: true,
              },
              orderBy: {
                createdAt: "asc",
              },
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
      const products = await Promise.all(
        [...new Set(tanks.map((tank) => tank.grade))].map((grade) =>
          transaction.product.upsert({
            where: { grade },
            update: {
              isActive: true,
            },
            create: {
              grade,
              name: productNames[grade],
            },
          }),
        ),
      );
      const productsByGrade = new Map(
        products.map((product) => [product.grade, product]),
      );

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
            connect: {
              id: userId,
            },
          },
          tanks: {
            create: tanks.map((tank) => {
              const product = productsByGrade.get(tank.grade);

              if (!product) {
                throw new BadRequestException("Tank product is unavailable.");
              }

              return {
                name: tank.name,
                capacity: tank.capacity,
                currentDip: tank.currentDip,
                productId: product.id,
                movements:
                  Number(tank.currentDip) > 0
                    ? {
                        create: {
                          productId: product.id,
                          type: "DIP_ADJUSTMENT",
                          quantity: tank.currentDip,
                          note: "Station setup opening dip",
                        },
                      }
                    : undefined,
              };
            }),
          },
        },
        include: {
          organization: true,
          tanks: {
            include: {
              product: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    });

    return {
      requiresSetup: false,
      station,
    };
  }

  private normalizeTanks(tanks: TankSetupInput[] | undefined) {
    if (!Array.isArray(tanks) || tanks.length === 0) {
      throw new BadRequestException("Add at least one station tank.");
    }

    return tanks.map((tank, index): NormalizedTank => {
      const name = this.requiredText(tank.name, `Tank ${index + 1} name`);
      const capacity = this.positiveDecimal(tank.capacity, `${name} capacity`);
      const currentDip = this.nonNegativeDecimal(
        tank.currentDip,
        `${name} opening dip`,
      );

      if (!Object.values(FuelGrade).includes(tank.grade)) {
        throw new BadRequestException(`${name} has an invalid fuel grade.`);
      }

      if (Number(currentDip) > Number(capacity)) {
        throw new BadRequestException(
          `${name} opening dip cannot exceed capacity.`,
        );
      }

      return {
        name,
        grade: tank.grade,
        capacity,
        currentDip,
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
}
