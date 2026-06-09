import { useState } from "react";
import { Plus, RefreshCw, UserRound } from "lucide-react";
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
import { useCreditCustomers } from "../hooks/use-credit-customers";
import { CreditorForm } from "./creditor-form";

function formatINR(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CreditPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { customers, isPending, error, refetch } = useCreditCustomers();

  const activeCount = customers.filter((c) => c.isActive).length;
  const totalLimit = customers.reduce(
    (sum, c) => sum + Number(c.creditLimit),
    0,
  );
  const totalSalesCount = customers.reduce(
    (sum, c) => sum + c._count.sales,
    0,
  );

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Accounts
          </p>
          <h1 className="text-3xl font-bold">Credit</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh credit customers"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            Add Creditor
          </Button>
        </div>
      </header>

      {formOpen && (
        <CreditorForm
          onClose={() => setFormOpen(false)}
          onSaved={() => { void refetch(); }}
        />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section
        className="grid grid-cols-[repeat(4,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Credit summary"
      >
        {[
          { label: "Total accounts", value: String(customers.length) },
          { label: "Active accounts", value: String(activeCount) },
          { label: "Total credit limit", value: `₹${formatINR(totalLimit)}` },
          { label: "Credit sales", value: String(totalSalesCount) },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">
                <UserRound size={20} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">
                {metric.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </section>

      {customers.length === 0 && !isPending ? (
        <div className="grid gap-2 justify-items-center content-center min-h-[60vh] text-muted-foreground">
          <UserRound size={32} />
          <p className="text-sm">No credit accounts yet.</p>
        </div>
      ) : (
        <Card className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-bold">
              Credit accounts
            </CardTitle>
            <CardAction>
              <span className="text-xs text-muted-foreground">
                {isPending ? "Loading..." : `${customers.length} accounts`}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="max-md:hidden">Credit limit</TableHead>
                  <TableHead className="max-md:hidden">Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.vehicleNo ?? "—"}</TableCell>
                    <TableCell>{customer.phone ?? "—"}</TableCell>
                    <TableCell className="max-md:hidden">
                      ₹{formatINR(Number(customer.creditLimit))}
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      {customer._count.sales}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
