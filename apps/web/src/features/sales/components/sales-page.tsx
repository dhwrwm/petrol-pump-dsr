import { Pencil, ReceiptText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { LayoutContext } from "../../../components/protected-layout";
import type { ProductType } from "../../setup/types/setup.types";
import { DailyRatesCard, useTodayRates } from "../../fuel-rates";
import type { CurrentShift, Sale } from "../../shift/types/shift.types";
import { getCurrentShift } from "../api/sales.api";
import { useSales } from "../hooks/use-sales";
import { SalesForm } from "./sales-form";

function formatINR(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SalesPage() {
  const { station } = useOutletContext<LayoutContext>();
  const [addSaleOpen, setAddSaleOpen] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [currentShift, setCurrentShift] = useState<CurrentShift | null>(null);
  const { sales, isPending, error, refetch } = useSales();
  const { rates, isPending: ratesPending, isSaving, error: ratesError, save } =
    useTodayRates();

  useEffect(() => {
    void getCurrentShift().then(setCurrentShift).catch(() => setCurrentShift(null));
  }, []);

  // Unique product types that have active nozzles at this station
  const requiredTypes = [
    ...new Set(
      station.tanks.flatMap((t) =>
        t.nozzles.filter((n) => n.isActive).map((n) => n.productType),
      ),
    ),
  ] as ProductType[];

  const ratesComplete =
    !ratesPending &&
    requiredTypes.every((pt) => rates.some((r) => r.productType === pt));

  const usedNozzleIds = currentShift
    ? sales.filter((s) => s.shiftId === currentShift.id).map((s) => s.nozzleId)
    : [];

  const formOpen = addSaleOpen || editSale !== null;

  const openAddSale = () => setAddSaleOpen(true);

  const closeForm = () => {
    setAddSaleOpen(false);
    setEditSale(null);
  };

  const handleSaved = () => {
    refetch();
    void getCurrentShift().then(setCurrentShift).catch(() => setCurrentShift(null));
  };

  const totalAmount = sales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalLiters = sales.reduce((sum, s) => sum + Number(s.liters), 0);

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Transaction log
          </p>
          <h1 className="text-3xl font-bold">Sales</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh sales"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </header>

      <DailyRatesCard
        requiredTypes={requiredTypes}
        rates={rates}
        isSaving={isSaving}
        error={ratesError}
        onSave={save}
      />

      <div className="flex items-center gap-3">
        <Button
          onClick={openAddSale}
          disabled={!ratesComplete || formOpen}
          title={!ratesComplete ? "Set today's rates first" : undefined}
        >
          Add Sale
        </Button>
        {!ratesComplete && !ratesPending && (
          <p className="text-sm text-muted-foreground">
            Set today's rates above to enable sales entry.
          </p>
        )}
      </div>

      {formOpen && (
        <SalesForm
          station={station}
          rates={rates}
          shift={currentShift}
          usedNozzleIds={usedNozzleIds}
          editSale={editSale ?? undefined}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}

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
          { label: "Total sales", value: String(sales.length) },
          { label: "Revenue", value: `₹${formatINR(totalAmount)}` },
          { label: "Volume sold", value: `${totalLiters.toFixed(3)} L` },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">
                <ReceiptText size={20} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">
                {metric.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg font-bold">All sales</CardTitle>
          <CardAction>
            <span className="text-xs text-muted-foreground">
              {isPending ? "Loading..." : `${sales.length} records`}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4">
          {sales.length === 0 && !isPending ? (
            <div className="grid gap-2 justify-items-center content-center min-h-[40vh] text-muted-foreground">
              <ReceiptText size={32} />
              <p className="text-sm">No sales recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nozzle</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead className="max-md:hidden">Amount</TableHead>
                  <TableHead className="max-md:hidden">Mode</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>Nozzle #{sale.nozzle.nozzleNumber}</TableCell>
                    <TableCell>{sale.productType}</TableCell>
                    <TableCell>{Number(sale.liters).toFixed(3)}</TableCell>
                    <TableCell className="max-md:hidden">
                      ₹{formatINR(Number(sale.amount))}
                    </TableCell>
                    <TableCell
                      className="max-md:hidden"
                      title={formatTime(sale.soldAt)}
                    >
                      {sale.payments[0]?.method ?? "—"}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        aria-label="Edit sale"
                        onClick={() => setEditSale(sale)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
