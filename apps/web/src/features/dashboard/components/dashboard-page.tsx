import { useState } from "react";
import {
  Droplets,
  IndianRupee,
  LayoutDashboard,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSalesSummary } from "../hooks/use-sales-summary";

function formatINR(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DashboardPage() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const { summary, isPending, error, refetch } = useSalesSummary(period);

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Overview
          </p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="flex gap-2.5">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === "week"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setPeriod("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === "month"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setPeriod("month")}
            >
              Month
            </button>
          </div>
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh dashboard"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section
        className="grid grid-cols-[repeat(4,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Sales summary"
      >
        {[
          {
            label: "Total Revenue",
            value: summary
              ? `₹${formatINR(Number(summary.totalRevenue))}`
              : "—",
            icon: IndianRupee,
          },
          {
            label: "Total Volume",
            value: summary ? `${Number(summary.totalVolume).toFixed(1)} L` : "—",
            icon: Droplets,
          },
          {
            label: "Transactions",
            value: summary ? String(summary.totalTransactions) : "—",
            icon: ShoppingCart,
          },
          {
            label: "Avg Daily Revenue",
            value: summary
              ? `₹${formatINR(Number(summary.avgDailyRevenue))}`
              : "—",
            icon: TrendingUp,
          },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">
                <metric.icon size={20} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">
                {metric.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </section>

      {!summary && !isPending && !error ? (
        <div className="grid gap-2 justify-items-center content-center min-h-[60vh] text-muted-foreground">
          <LayoutDashboard size={32} />
          <p className="text-sm">No sales data for this period.</p>
        </div>
      ) : (
        <>
          <Card className="py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-lg font-bold">
                Daily breakdown
              </CardTitle>
              <CardAction>
                <span className="text-xs text-muted-foreground">
                  {isPending
                    ? "Loading..."
                    : `${summary?.dailyBreakdown.length ?? 0} days`}
                </span>
              </CardAction>
            </CardHeader>
            <CardContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.dailyBreakdown.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{day.date}</TableCell>
                      <TableCell>
                        ₹{formatINR(Number(day.totalAmount))}
                      </TableCell>
                      <TableCell>
                        {Number(day.totalLiters).toFixed(1)} L
                      </TableCell>
                      <TableCell>{day.saleCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
            <Card className="py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-lg font-bold">
                  Revenue by fuel grade
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grade</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="max-md:hidden">Volume</TableHead>
                      <TableHead className="max-md:hidden">Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.byFuelGrade.map((grade) => (
                      <TableRow key={grade.grade}>
                        <TableCell>
                          <Badge variant="secondary">{grade.productName}</Badge>
                        </TableCell>
                        <TableCell>
                          ₹{formatINR(Number(grade.totalAmount))}
                        </TableCell>
                        <TableCell className="max-md:hidden">
                          {Number(grade.totalLiters).toFixed(1)} L
                        </TableCell>
                        <TableCell className="max-md:hidden">
                          {grade.saleCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-lg font-bold">
                  Payment methods
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.byPaymentMethod.map((pm) => (
                      <TableRow key={pm.method}>
                        <TableCell>{pm.method}</TableCell>
                        <TableCell>
                          ₹{formatINR(Number(pm.totalAmount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
