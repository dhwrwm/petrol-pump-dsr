import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "../../lib/prisma.js";
import { CreateSaleDto } from "./sales.dto.js";

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
        product: { select: { grade: true, name: true } },
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
      const entry = gradeMap.get(sale.product.grade) ?? {
        productName: sale.product.name,
        totalAmount: 0,
        totalLiters: 0,
        saleCount: 0,
      };
      entry.totalAmount += Number(sale.amount);
      entry.totalLiters += Number(sale.liters);
      entry.saleCount += 1;
      gradeMap.set(sale.product.grade, entry);
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
        product: true,
        nozzle: true,
        customer: true,
        payments: true,
      },
      orderBy: {
        soldAt: "desc",
      },
      take: 100,
    });
  }

  async create(input: CreateSaleDto) {
    const liters = input.liters;
    const rate = input.rate;
    const amount = (Number(liters) * Number(rate)).toFixed(2);

    return prisma.sale.create({
      data: {
        shiftId: input.shiftId,
        nozzleId: input.nozzleId,
        productId: input.productId,
        customerId: input.customerId,
        liters,
        rate,
        amount,
        payments: input.paymentMethod
          ? {
              create: {
                shiftId: input.shiftId,
                method: input.paymentMethod,
                amount,
                reference: input.paymentReference,
              },
            }
          : undefined,
      },
      include: {
        payments: true,
      },
    });
  }
}
