import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import { CreateSaleDto, UpdateSaleDto } from "./sales.dto.js";

const productTypeNames: Record<string, string> = {
  MS: "Petrol (MS)",
  HSD: "Diesel (HSD)",
  XP95: "Premium (XP95)",
  OTHERS: "Other",
};

@Injectable()
export class SalesService {
  async summary(userId: string, period: "week" | "month") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });

    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    const now = new Date();
    const daysAgo = period === "week" ? 7 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        shift: { stationId: user.stationId },
        soldAt: { gte: startDate },
      },
      include: {
        payments: { select: { method: true, amount: true } },
      },
      orderBy: { soldAt: "desc" },
    });

    // Daily breakdown
    const dailyMap = new Map<
      string,
      { totalAmount: number; totalLiters: number; saleCount: number }
    >();
    for (const sale of sales) {
      const dateKey = sale.soldAt.toISOString().split("T")[0];
      const entry = dailyMap.get(dateKey) ?? {
        totalAmount: 0,
        totalLiters: 0,
        saleCount: 0,
      };
      entry.totalAmount += Number(sale.amount);
      entry.totalLiters += Number(sale.liters);
      entry.saleCount += 1;
      dailyMap.set(dateKey, entry);
    }

    // By fuel grade
    const gradeMap = new Map<
      string,
      {
        productName: string;
        totalAmount: number;
        totalLiters: number;
        saleCount: number;
      }
    >();
    for (const sale of sales) {
      const grade = sale.productType;
      const entry = gradeMap.get(grade) ?? {
        productName: productTypeNames[grade] ?? grade,
        totalAmount: 0,
        totalLiters: 0,
        saleCount: 0,
      };
      entry.totalAmount += Number(sale.amount);
      entry.totalLiters += Number(sale.liters);
      entry.saleCount += 1;
      gradeMap.set(grade, entry);
    }

    // By payment method
    const paymentMap = new Map<string, number>();
    for (const sale of sales) {
      for (const payment of sale.payments) {
        const current = paymentMap.get(payment.method) ?? 0;
        paymentMap.set(payment.method, current + Number(payment.amount));
      }
    }

    const totalRevenue = sales.reduce((s, sale) => s + Number(sale.amount), 0);
    const totalVolume = sales.reduce((s, sale) => s + Number(sale.liters), 0);
    const uniqueDays = dailyMap.size || 1;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalRevenue: totalRevenue.toFixed(2),
      totalVolume: totalVolume.toFixed(3),
      totalTransactions: sales.length,
      avgDailyRevenue: (totalRevenue / uniqueDays).toFixed(2),
      dailyBreakdown: [...dailyMap.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, data]) => ({
          date,
          totalAmount: data.totalAmount.toFixed(2),
          totalLiters: data.totalLiters.toFixed(3),
          saleCount: data.saleCount,
        })),
      byFuelGrade: [...gradeMap.entries()].map(([grade, data]) => ({
        grade,
        productName: data.productName,
        totalAmount: data.totalAmount.toFixed(2),
        totalLiters: data.totalLiters.toFixed(3),
        saleCount: data.saleCount,
      })),
      byPaymentMethod: [...paymentMap.entries()].map(([method, amount]) => ({
        method,
        totalAmount: amount.toFixed(2),
      })),
    };
  }

  async list(userId: string, shiftId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });

    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    return prisma.sale.findMany({
      where: {
        shift: { stationId: user.stationId },
        ...(shiftId ? { shiftId } : {}),
      },
      include: {
        nozzle: true,
        customer: true,
        payments: true,
        meterReading: { select: { openingMeter: true, closingMeter: true } },
      },
      orderBy: { soldAt: "desc" },
      take: 100,
    });
  }

  async getLastMeterReading(nozzleId: string) {
    const reading = await prisma.meterReading.findFirst({
      where: { nozzleId, closingMeter: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { closingMeter: true },
    });
    return {
      lastClosingMeter: reading?.closingMeter?.toString() ?? "0.000",
    };
  }

  async create(userId: string, input: CreateSaleDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });
    if (!user?.stationId) {
      throw new NotFoundException("No station assigned to this user.");
    }

    const nozzle = await prisma.nozzle.findUnique({
      where: { id: input.nozzleId },
      select: { productType: true },
    });
    if (!nozzle) {
      throw new NotFoundException("Nozzle not found.");
    }

    const liters = (
      Number(input.closingMeter) - Number(input.openingMeter)
    ).toFixed(3);

    if (Number(liters) <= 0) {
      throw new NotFoundException(
        "Closing meter must be greater than opening meter.",
      );
    }

    let shift = await prisma.shift.findFirst({
      where: { stationId: user.stationId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    });
    if (!shift) {
      shift = await prisma.shift.create({
        data: { stationId: user.stationId, openedById: userId },
      });
    }

    const existingReading = await prisma.meterReading.findUnique({
      where: {
        shiftId_nozzleId: { shiftId: shift.id, nozzleId: input.nozzleId },
      },
    });

    let meterReadingId: string;
    if (!existingReading) {
      const reading = await prisma.meterReading.create({
        data: {
          shiftId: shift.id,
          nozzleId: input.nozzleId,
          openingMeter: input.openingMeter,
          closingMeter: input.closingMeter,
        },
      });
      meterReadingId = reading.id;
    } else {
      await prisma.meterReading.update({
        where: { id: existingReading.id },
        data: { closingMeter: input.closingMeter },
      });
      meterReadingId = existingReading.id;
    }

    const amount = input.payments
      .reduce((sum, p) => sum + Number(p.amount), 0)
      .toFixed(2);

    const shiftId = shift.id;

    return prisma.sale.create({
      data: {
        shiftId,
        nozzleId: input.nozzleId,
        meterReadingId,
        productType: nozzle.productType,
        liters,
        rate: input.rate,
        amount,
        payments: {
          create: input.payments.map((p) => ({
            shiftId,
            method: p.method,
            amount: p.amount,
            reference: p.reference,
          })),
        },
      },
      include: { payments: true, nozzle: true, meterReading: { select: { openingMeter: true, closingMeter: true } } },
    });
  }

  async getCurrentShift(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stationId: true },
    });
    if (!user?.stationId) return null;

    const shift = await prisma.shift.findFirst({
      where: { stationId: user.stationId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    });
    if (!shift) return null;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const shiftNumber = await prisma.shift.count({
      where: { stationId: user.stationId, openedAt: { gte: startOfDay } },
    });

    return {
      id: shift.id,
      openedAt: shift.openedAt.toISOString(),
      shiftNumber,
    };
  }

  async update(saleId: string, userId: string, input: UpdateSaleDto) {
    const sale = await prisma.sale.findFirst({
      where: {
        id: saleId,
        shift: { station: { users: { some: { id: userId } } } },
      },
      include: { meterReading: true },
    });
    if (!sale) throw new NotFoundException("Sale not found.");

    const liters = (
      Number(input.closingMeter) - Number(sale.meterReading.openingMeter)
    ).toFixed(3);

    if (Number(liters) <= 0) {
      throw new BadRequestException(
        "Closing meter must be greater than opening meter.",
      );
    }

    const amount = input.payments
      .reduce((sum, p) => sum + Number(p.amount), 0)
      .toFixed(2);

    await prisma.$transaction(async (tx) => {
      await tx.meterReading.update({
        where: { id: sale.meterReadingId },
        data: { closingMeter: input.closingMeter },
      });
      await tx.payment.deleteMany({ where: { saleId } });
      await tx.sale.update({
        where: { id: saleId },
        data: { liters, amount },
      });
      await tx.payment.createMany({
        data: input.payments.map((p) => ({
          saleId,
          shiftId: sale.shiftId,
          method: p.method,
          amount: p.amount,
          reference: p.reference ?? null,
        })),
      });
    });

    return prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        payments: true,
        nozzle: true,
        meterReading: { select: { openingMeter: true, closingMeter: true } },
      },
    });
  }
}
