import { ReceiptText, RefreshCw } from "lucide-react";
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
import { useSales } from "../hooks/use-sales";

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
  const { sales, isPending, error, refetch } = useSales();

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.nozzle.label}</TableCell>
                    <TableCell>{sale.product.name}</TableCell>
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
