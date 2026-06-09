import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import type { SetTodayRatesDto } from "./fuel-rates.dto.js";

function todayDate() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

@Injectable()
export class FuelRatesService {
  async getTodayRates(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });
    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    const rates = await prisma.fuelRate.findMany({
      where: { stationId: user.stationId, effectiveDate: todayDate() },
      select: { productType: true, rate: true },
    });

    return rates.map((r) => ({
      productType: r.productType,
      rate: r.rate.toString(),
    }));
  }

  async setTodayRates(userId: string, input: SetTodayRatesDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });
    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    const today = todayDate();

    await Promise.all(
      input.rates.map((r) =>
        prisma.fuelRate.upsert({
          where: {
            stationId_productType_effectiveDate: {
              stationId: user.stationId!,
              productType: r.productType,
              effectiveDate: today,
            },
          },
          create: {
            stationId: user.stationId!,
            productType: r.productType,
            rate: r.rate,
            effectiveDate: today,
          },
          update: { rate: r.rate },
        }),
      ),
    );

    return this.getTodayRates(userId);
  }
}
