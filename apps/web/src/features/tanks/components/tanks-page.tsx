import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Droplets,
  Gauge,
  Plus,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addDispenserToTank,
  addNozzle,
  createTank,
  deleteDispenser,
  deleteNozzle,
  deleteTank,
  updateTankDip,
} from "../api/tanks.api";
import { useTanks } from "../hooks/use-tanks";
import { PRODUCT_LABELS, type ProductType } from "../types/tanks.types";

const PRODUCT_TYPES: ProductType[] = ["MS", "HSD", "XP95", "OTHERS"];

function AddTankForm({ onSuccess }: { onSuccess: () => void }) {
  const [productType, setProductType] = useState<ProductType>("MS");
  const [capacity, setCapacity] = useState("");
  const [currentDip, setCurrentDip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!capacity.trim()) return;
    setLoading(true);
    setError("");
    try {
      await createTank({ productType, capacity: capacity.trim(), currentDip: currentDip.trim() || undefined });
      setCapacity("");
      setCurrentDip("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tank.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 pt-3 border-t">
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <div className="grid gap-1.5">
          <Label>Product type</Label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
          >
            {PRODUCT_TYPES.map((pt) => (
              <option key={pt} value={pt}>{PRODUCT_LABELS[pt]}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label>Capacity (L)</Label>
          <Input
            type="number"
            min="0"
            step="0.001"
            placeholder="e.g. 10000"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Current dip (L)</Label>
          <Input
            type="number"
            min="0"
            step="0.001"
            placeholder="e.g. 4500"
            value={currentDip}
            onChange={(e) => setCurrentDip(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Adding…" : "Add tank"}
        </Button>
      </div>
    </form>
  );
}

function UpdateDipForm({
  tankId,
  currentDip,
  onSuccess,
  onCancel,
}: {
  tankId: string;
  currentDip: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [dip, setDip] = useState(currentDip);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateTankDip(tankId, dip);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update dip.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="grid gap-1">
        <Label className="text-xs">New dip (L)</Label>
        <Input
          type="number"
          min="0"
          step="0.001"
          value={dip}
          onChange={(e) => setDip(e.target.value)}
          className="h-8 w-36 text-sm"
          required
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" className="h-8" disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}

function AddDispenserForm({
  tankId,
  onSuccess,
  onCancel,
}: {
  tankId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addDispenserToTank(tankId, { companyName: companyName.trim(), serialNo: serialNo.trim() || undefined });
      setCompanyName("");
      setSerialNo("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add dispenser.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end mt-2 pl-4 border-l-2 border-muted">
      <div className="grid gap-1">
        <Label className="text-xs">Company name</Label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Tatsuno"
          className="h-8 text-sm w-40"
          required
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs">Serial no. (optional)</Label>
        <Input
          value={serialNo}
          onChange={(e) => setSerialNo(e.target.value)}
          placeholder="e.g. SN-001"
          className="h-8 text-sm w-32"
        />
      </div>
      {error && <p className="text-xs text-destructive self-center">{error}</p>}
      <Button type="submit" size="sm" className="h-8" disabled={loading}>
        {loading ? "Adding…" : "Add dispenser"}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}

function AddNozzleForm({
  dispenserId,
  onSuccess,
  onCancel,
}: {
  dispenserId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [productType, setProductType] = useState<ProductType>("MS");
  const [openingMeterReading, setOpeningMeterReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!openingMeterReading.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addNozzle(dispenserId, { productType, openingMeterReading: openingMeterReading.trim() });
      setOpeningMeterReading("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add nozzle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end mt-2 pl-4 border-l-2 border-muted">
      <div className="grid gap-1">
        <Label className="text-xs">Product</Label>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-sm w-36"
          value={productType}
          onChange={(e) => setProductType(e.target.value as ProductType)}
        >
          {PRODUCT_TYPES.map((pt) => (
            <option key={pt} value={pt}>{PRODUCT_LABELS[pt]}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <Label className="text-xs">Opening meter reading</Label>
        <Input
          type="number"
          min="0"
          step="0.001"
          value={openingMeterReading}
          onChange={(e) => setOpeningMeterReading(e.target.value)}
          placeholder="e.g. 12345.000"
          className="h-8 text-sm w-40"
          required
        />
      </div>
      {error && <p className="text-xs text-destructive self-center">{error}</p>}
      <Button type="submit" size="sm" className="h-8" disabled={loading}>
        {loading ? "Adding…" : "Add nozzle"}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}

export function TanksPage() {
  const { tanks, isPending, error, refetch } = useTanks();

  const [showAddTank, setShowAddTank] = useState(false);
  const [dipTankId, setDipTankId] = useState<string | null>(null);
  const [dispenserTankId, setDispenserTankId] = useState<string | null>(null);
  const [nozzleDispenserId, setNozzleDispenserId] = useState<string | null>(null);
  const [collapsedTanks, setCollapsedTanks] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const totalCapacity = tanks.reduce((sum, t) => sum + Number(t.capacity), 0);
  const totalStock = tanks.reduce((sum, t) => sum + Number(t.currentDip), 0);
  const overallLevel = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;

  function toggleTank(id: string) {
    setCollapsedTanks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteTank(id: string) {
    if (!confirm("Delete this tank and all its dispensers?")) return;
    setDeletingId(id);
    setActionError("");
    try {
      await deleteTank(id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete tank.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteDispenser(id: string) {
    if (!confirm("Delete this dispenser and all its nozzles?")) return;
    setDeletingId(id);
    setActionError("");
    try {
      await deleteDispenser(id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete dispenser.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteNozzle(dispenserId: string, nozzleId: string) {
    if (!confirm("Delete this nozzle?")) return;
    setDeletingId(nozzleId);
    setActionError("");
    try {
      await deleteNozzle(dispenserId, nozzleId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete nozzle.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Inventory
          </p>
          <h1 className="text-3xl font-bold">Tanks</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh tanks"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
          <Button
            type="button"
            onClick={() => setShowAddTank((v) => !v)}
          >
            <Plus size={16} />
            Add tank
          </Button>
        </div>
      </header>

      {(error || actionError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || actionError}</AlertDescription>
        </Alert>
      )}

      <section
        className="grid grid-cols-[repeat(4,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Tank summary"
      >
        {[
          { label: "Total tanks", value: String(tanks.length) },
          { label: "Total stock", value: `${totalStock.toLocaleString("en-IN")} L` },
          { label: "Total capacity", value: `${totalCapacity.toLocaleString("en-IN")} L` },
          { label: "Overall level", value: `${overallLevel}%` },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">
                <Droplets size={20} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">{metric.value}</strong>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg font-bold">All tanks</CardTitle>
          <CardAction>
            <span className="text-xs text-muted-foreground">
              {isPending ? "Loading…" : `${tanks.length} tank${tanks.length !== 1 ? "s" : ""}`}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4 grid gap-4">
          {showAddTank && (
            <AddTankForm
              onSuccess={() => {
                setShowAddTank(false);
                refetch();
              }}
            />
          )}

          {!isPending && tanks.length === 0 && !showAddTank && (
            <div className="grid gap-2 justify-items-center content-center py-16 text-muted-foreground">
              <Droplets size={32} />
              <p className="text-sm">No tanks configured yet. Click "Add tank" to get started.</p>
            </div>
          )}

          {tanks.map((tank) => {
            const capacity = Number(tank.capacity);
            const dip = Number(tank.currentDip);
            const level = capacity > 0 ? Math.round((dip / capacity) * 100) : 0;
            const isCollapsed = collapsedTanks.has(tank.id);

            return (
              <article key={tank.id} className="border rounded-lg overflow-hidden">
                {/* Tank header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/40">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => toggleTank(tank.id)}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                  >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Droplets size={15} className="text-primary shrink-0" />
                      <strong className="text-sm">{PRODUCT_LABELS[tank.productType]}</strong>
                      <Badge variant="outline" className="text-xs font-normal">
                        {dip.toLocaleString("en-IN")} / {capacity.toLocaleString("en-IN")} L · {level}%
                      </Badge>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden w-full max-w-xs">
                      <span
                        className="block h-full bg-primary rounded-full transition-all"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {dipTankId === tank.id ? null : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setDipTankId(tank.id);
                          setDispenserTankId(null);
                        }}
                      >
                        Update dip
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      disabled={deletingId === tank.id}
                      onClick={() => handleDeleteTank(tank.id)}
                      aria-label="Delete tank"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Update dip inline */}
                {dipTankId === tank.id && (
                  <div className="px-4 py-2 border-b bg-background">
                    <UpdateDipForm
                      tankId={tank.id}
                      currentDip={tank.currentDip}
                      onSuccess={() => { setDipTankId(null); refetch(); }}
                      onCancel={() => setDipTankId(null)}
                    />
                  </div>
                )}

                {/* Dispensers section */}
                {!isCollapsed && (
                  <div className="px-4 py-3 grid gap-3">
                    {tank.dispensers.length === 0 && dispenserTankId !== tank.id && (
                      <p className="text-xs text-muted-foreground">No dispensers assigned to this tank.</p>
                    )}

                    {tank.dispensers.map((dispenser) => (
                      <div key={dispenser.id} className="border rounded-md overflow-hidden">
                        {/* Dispenser header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/20">
                          <Gauge size={14} className="text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium flex-1">
                            {dispenser.companyName}
                            {dispenser.serialNo && (
                              <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                                #{dispenser.serialNo}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground mr-1">
                            {dispenser.nozzles.length} nozzle{dispenser.nozzles.length !== 1 ? "s" : ""}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            disabled={deletingId === dispenser.id}
                            onClick={() => handleDeleteDispenser(dispenser.id)}
                            aria-label="Delete dispenser"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>

                        {/* Nozzles */}
                        <div className="px-3 py-2 grid gap-1.5">
                          {dispenser.nozzles.map((nozzle) => (
                            <div key={nozzle.id} className="flex items-center gap-2 text-xs">
                              <Zap size={12} className="text-muted-foreground shrink-0" />
                              <span className="flex-1">
                                <span className="font-medium">{PRODUCT_LABELS[nozzle.productType]}</span>
                                <span className="text-muted-foreground ml-1.5">
                                  Opening: {Number(nozzle.openingMeterReading).toLocaleString("en-IN")}
                                  {nozzle.closingMeterReading && (
                                    <> · Closing: {Number(nozzle.closingMeterReading).toLocaleString("en-IN")}</>
                                  )}
                                </span>
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-destructive hover:text-destructive"
                                disabled={deletingId === nozzle.id}
                                onClick={() => handleDeleteNozzle(dispenser.id, nozzle.id)}
                                aria-label="Delete nozzle"
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          ))}

                          {nozzleDispenserId === dispenser.id ? (
                            <AddNozzleForm
                              dispenserId={dispenser.id}
                              onSuccess={() => { setNozzleDispenserId(null); refetch(); }}
                              onCancel={() => setNozzleDispenserId(null)}
                            />
                          ) : (
                            <button
                              type="button"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5 w-fit"
                              onClick={() => {
                                setNozzleDispenserId(dispenser.id);
                                setDispenserTankId(null);
                              }}
                            >
                              <Plus size={12} />
                              Add nozzle
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add dispenser */}
                    {dispenserTankId === tank.id ? (
                      <AddDispenserForm
                        tankId={tank.id}
                        onSuccess={() => { setDispenserTankId(null); refetch(); }}
                        onCancel={() => setDispenserTankId(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                        onClick={() => {
                          setDispenserTankId(tank.id);
                          setNozzleDispenserId(null);
                        }}
                      >
                        <Plus size={12} />
                        Add dispenser
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
