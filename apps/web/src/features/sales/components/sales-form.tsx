import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_LABELS } from "../../setup/types/setup.types";
import type { StationSetup, ProductType } from "../../setup/types/setup.types";
import type { FuelRate } from "../../fuel-rates/types/fuel-rates.types";
import type { CurrentShift, Sale } from "../../shift/types/shift.types";
import { createSale, getNozzleMeter, updateSale } from "../api/sales.api";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type PaymentRow = {
  method: PaymentMethod;
  amount: string;
};

type Props = {
  station: StationSetup;
  rates: FuelRate[];
  shift: CurrentShift | null;
  usedNozzleIds: string[];
  editSale?: Sale;
  onClose: () => void;
  onSaved: () => void;
};

export function SalesForm({
  station,
  rates,
  shift,
  usedNozzleIds,
  editSale,
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(editSale);
  const nozzles = station.tanks.flatMap((t) =>
    t.nozzles.filter((n) => n.isActive),
  );

  const [nozzleId, setNozzleId] = useState(
    editSale?.nozzleId ??
      nozzles.find((n) => !usedNozzleIds.includes(n.id))?.id ??
      nozzles[0]?.id ??
      "",
  );
  const [openingMeter, setOpeningMeter] = useState("");
  const [closingMeter, setClosingMeter] = useState("");
  const [payments, setPayments] = useState<PaymentRow[]>([
    { method: "CASH", amount: "" },
  ]);
  const [isMeterLoading, setIsMeterLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editSale) {
      setOpeningMeter(editSale.meterReading.openingMeter);
      setClosingMeter(editSale.meterReading.closingMeter ?? "");
      setPayments(
        editSale.payments.length > 0
          ? editSale.payments.map((p) => ({
              method: p.method as PaymentMethod,
              amount: p.amount,
            }))
          : [{ method: "CASH", amount: "" }],
      );
      return;
    }

    if (!nozzleId) return;
    setIsMeterLoading(true);
    setOpeningMeter("");
    setClosingMeter("");

    void getNozzleMeter(nozzleId)
      .then(({ lastClosingMeter }) => setOpeningMeter(lastClosingMeter))
      .catch(() => setOpeningMeter("0.000"))
      .finally(() => setIsMeterLoading(false));
  }, [nozzleId, editSale]);

  const selectedNozzle = nozzles.find((n) => n.id === nozzleId);
  const rate = rates.find(
    (r) => r.productType === selectedNozzle?.productType,
  )?.rate;

  const liters =
    openingMeter && closingMeter
      ? Math.max(0, Number(closingMeter) - Number(openingMeter))
      : null;

  const total = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const addPayment = () =>
    setPayments((prev) => [...prev, { method: "CASH", amount: "" }]);

  const removePayment = (i: number) =>
    setPayments((prev) => prev.filter((_, idx) => idx !== i));

  const updatePayment = (i: number, field: keyof PaymentRow, value: string) =>
    setPayments((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPayments = payments.filter((p) => Number(p.amount) > 0);

    if (!nozzleId || !openingMeter || !closingMeter) {
      setError("Fill in all meter readings.");
      return;
    }
    if (Number(closingMeter) <= Number(openingMeter)) {
      setError("Closing meter must be greater than opening meter.");
      return;
    }
    if (!isEdit && !rate) {
      setError("No rate found for this nozzle's fuel type.");
      return;
    }
    if (validPayments.length === 0) {
      setError("Add at least one payment.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isEdit && editSale) {
        await updateSale(editSale.id, { closingMeter, payments: validPayments });
      } else {
        await createSale({
          nozzleId,
          openingMeter,
          closingMeter,
          rate: rate!,
          payments: validPayments,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Sale" : "New Sale"}
          </h2>
          {shift && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Shift #{shift.shiftNumber} · opened{" "}
              {new Date(shift.openedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        {/* Nozzle */}
        <div className="space-y-1.5">
          <Label>Nozzle</Label>
          {isEdit ? (
            <div className="w-full border rounded-md p-2 bg-muted text-muted-foreground text-sm">
              Nozzle #{selectedNozzle?.nozzleNumber} —{" "}
              {PRODUCT_LABELS[selectedNozzle?.productType as ProductType] ??
                selectedNozzle?.productType}
            </div>
          ) : (
            <Select value={nozzleId} onValueChange={setNozzleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select nozzle" />
              </SelectTrigger>
              <SelectContent>
                {nozzles.map((n) => {
                  const used = usedNozzleIds.includes(n.id);
                  return (
                    <SelectItem key={n.id} value={n.id} disabled={used}>
                      Nozzle #{n.nozzleNumber} —{" "}
                      {PRODUCT_LABELS[n.productType as ProductType] ??
                        n.productType}
                      {used ? " (already recorded)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          {rate && (
            <p className="text-xs text-muted-foreground">
              Today's rate: <strong>₹{Number(rate).toFixed(2)}/L</strong>
            </p>
          )}
        </div>

        {/* Meter readings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Opening meter</Label>
            <Input
              type="number"
              className="bg-muted text-muted-foreground cursor-not-allowed"
              placeholder={isMeterLoading ? "Loading..." : "0.000"}
              value={openingMeter}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Previous day's closing
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Closing meter</Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              placeholder="0.000"
              value={closingMeter}
              onChange={(e) => setClosingMeter(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Computed liters */}
        {liters !== null && (
          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-muted">
            <span className="text-muted-foreground">Liters dispensed:</span>
            <span className="font-semibold">
              {liters.toLocaleString("en-IN", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              L
            </span>
            {rate && liters > 0 && (
              <span className="ml-auto text-muted-foreground">
                @ ₹{rate}/L ={" "}
                <strong>
                  ₹
                  {(liters * Number(rate)).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </span>
            )}
          </div>
        )}

        {/* Payments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Payments</Label>
            <button
              type="button"
              onClick={addPayment}
              className="text-xs text-primary hover:underline"
            >
              + Add mode
            </button>
          </div>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select
                  value={p.method}
                  onValueChange={(v) =>
                    updatePayment(i, "method", v as PaymentMethod)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex-1"
                  placeholder="Amount (₹)"
                  value={p.amount}
                  onChange={(e) => updatePayment(i, "amount", e.target.value)}
                />
                {payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePayment(i)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove payment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-semibold text-right">
            Total: ₹
            {total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isMeterLoading}>
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Record Sale"}
          </Button>
        </div>
      </form>
    </div>
  );
}
