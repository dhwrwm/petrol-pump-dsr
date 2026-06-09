import {
  Banknote,
  CreditCard,
  Fuel,
  IndianRupee,
  LogOut,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LayoutContext } from "../../../components/protected-layout";
import { useSales } from "../hooks/use-sales";
import { type TankSummary } from "../types/shift.types";

function formatINR(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ShiftDashboard() {
  const { station, onSignOut } = useOutletContext<LayoutContext>();
  const { sales, isPending, refetch } = useSales();

  const tanks = station.tanks.map(
    (tank): TankSummary => ({
      name: tank.productType,
      fuel: tank.productType,
      level: Math.round(
        (Number(tank.currentDip) / Number(tank.capacity)) * 100,
      ),
      stock: `${Number(tank.currentDip).toLocaleString("en-IN")} L`,
    }),
  );

  const grossSales = sales.reduce((sum, s) => sum + Number(s.amount), 0);
  const fuelSold = sales.reduce((sum, s) => sum + Number(s.liters), 0);
  const cashTotal = sales.reduce((sum, s) => {
    const cashPayments = s.payments.filter((p) => p.method === "CASH");
    return sum + cashPayments.reduce((ps, p) => ps + Number(p.amount), 0);
  }, 0);
  const digitalTotal = sales.reduce((sum, s) => {
    const digitalPayments = s.payments.filter((p) => p.method !== "CASH");
    return sum + digitalPayments.reduce((ps, p) => ps + Number(p.amount), 0);
  }, 0);

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Station {station.code}
          </p>
          <h1 className="text-3xl font-bold">Morning shift</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh dashboard"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void onSignOut()}
            type="button"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </Button>
          <Button type="button">
            <Plus size={18} />
            New sale
          </Button>
        </div>
      </header>

      <section
        className="grid grid-cols-[repeat(4,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Shift summary"
      >
        {[
          {
            icon: <IndianRupee size={20} />,
            label: "Gross sales",
            value: `₹${formatINR(grossSales)}`,
          },
          {
            icon: <Fuel size={20} />,
            label: "Fuel sold",
            value: `${fuelSold.toFixed(3)} L`,
          },
          {
            icon: <Banknote size={20} />,
            label: "Cash in drawer",
            value: `₹${formatINR(cashTotal)}`,
          },
          {
            icon: <CreditCard size={20} />,
            label: "Digital payments",
            value: `₹${formatINR(digitalTotal)}`,
          },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">{metric.icon}</div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">
                {metric.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] gap-4 max-md:grid-cols-1">
        <Card className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-bold">Recent sales</CardTitle>
            <CardAction>
              <span className="text-xs text-muted-foreground">
                {isPending ? "Loading..." : `${sales.length} records`}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nozzle</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead className="max-md:hidden">Amount</TableHead>
                  <TableHead className="max-md:hidden">Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 && !isPending ? (
                  <TableRow>
                    <TableCell colSpan={5}>No sales recorded yet</TableCell>
                  </TableRow>
                ) : (
                  sales.slice(0, 10).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>Nozzle #{sale.nozzle.nozzleNumber}</TableCell>
                      <TableCell>{sale.productType}</TableCell>
                      <TableCell>{Number(sale.liters).toFixed(3)}</TableCell>
                      <TableCell className="max-md:hidden">
                        ₹{formatINR(Number(sale.amount))}
                      </TableCell>
                      <TableCell className="max-md:hidden">
                        {sale.payments[0]?.method ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-bold">Tank stock</CardTitle>
            <CardAction>
              <span className="text-xs text-muted-foreground">Dip ledger</span>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid gap-4">
              {tanks.map((tank) => (
                <article className="flex flex-col gap-2.5" key={tank.name}>
                  <div>
                    <strong>{tank.name}</strong>
                    <p className="text-xs text-muted-foreground">
                      {tank.fuel} · {tank.stock}
                    </p>
                  </div>
                  <div
                    className="h-2.5 rounded-full bg-muted overflow-hidden"
                    aria-label={`${tank.name} level ${tank.level}%`}
                  >
                    <span
                      className="block h-full bg-primary rounded-full"
                      style={{ width: `${tank.level}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg font-bold">
            Shift reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-[repeat(4,minmax(140px,1fr))] gap-3 max-md:grid-cols-1">
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Opening meter
              <Input defaultValue="0.000" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Closing meter
              <Input defaultValue="0.000" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Testing liters
              <Input defaultValue="0.000" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Expenses
              <Input defaultValue="0.00" />
            </label>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
