import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { PRODUCT_LABELS } from "../../setup/types/setup.types";
import type { ProductType } from "../../setup/types/setup.types";
import type { FuelRate } from "../types/fuel-rates.types";

type Props = {
  requiredTypes: ProductType[];
  rates: FuelRate[];
  isSaving: boolean;
  error: string;
  onSave: (rates: FuelRate[]) => void;
};

export function DailyRatesCard({
  requiredTypes,
  rates,
  isSaving,
  error,
  onSave,
}: Props) {
  const ratesComplete = requiredTypes.every((pt) =>
    rates.some((r) => r.productType === pt),
  );

  const [editing, setEditing] = useState(!ratesComplete);
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const pt of requiredTypes) {
      initial[pt] = rates.find((r) => r.productType === pt)?.rate ?? "";
    }
    return initial;
  });

  // When rates load in, sync draft
  const syncDraft = () => {
    const next: Record<string, string> = {};
    for (const pt of requiredTypes) {
      next[pt] = rates.find((r) => r.productType === pt)?.rate ?? "";
    }
    setDraft(next);
  };

  const handleEdit = () => {
    syncDraft();
    setEditing(true);
  };

  const handleSave = () => {
    const payload: FuelRate[] = requiredTypes
      .filter((pt) => Number(draft[pt]) > 0)
      .map((pt) => ({ productType: pt, rate: draft[pt] }));

    if (payload.length !== requiredTypes.length) return;

    onSave(payload);
    setEditing(false);
  };

  const allDraftFilled = requiredTypes.every((pt) => Number(draft[pt]) > 0);

  if (!editing && ratesComplete) {
    return (
      <Card className="py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base font-semibold">
            Today's Rates
          </CardTitle>
          <CardAction>
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Pencil size={12} />
              Edit
            </button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4 pt-3">
          <div className="flex flex-wrap gap-4">
            {rates.map((r) => (
              <div key={r.productType} className="text-sm">
                <span className="text-muted-foreground">
                  {PRODUCT_LABELS[r.productType as ProductType] ??
                    r.productType}
                </span>
                <strong className="ml-2">
                  ₹{Number(r.rate).toFixed(2)}/L
                </strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-4 border-amber-500/50 bg-amber-500/5">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-base font-semibold">
          Set Today's Rates
        </CardTitle>
        <CardAction>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Required before adding sales
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 pt-3">
        <div className="flex flex-wrap gap-3 items-end">
          {requiredTypes.map((pt) => (
            <div key={pt} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {PRODUCT_LABELS[pt as ProductType] ?? pt} (₹/L)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="border rounded-md p-2 bg-background text-sm w-32"
                placeholder="0.00"
                value={draft[pt] ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [pt]: e.target.value }))
                }
              />
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            disabled={!allDraftFilled || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Set Rates"}
          </Button>
          {editing && ratesComplete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
