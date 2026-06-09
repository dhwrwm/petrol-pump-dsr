import { useState } from "react";
import { NavLink } from "react-router";
import {
  ChevronDown,
  ChevronLeft,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PRODUCT_LABELS, type DispenserBase, type ProductType, type TankNozzle } from "../types/tanks.types";

function groupNozzlesByDispenser(
  nozzles: TankNozzle[],
): Array<DispenserBase & { nozzles: TankNozzle[] }> {
  const map = new Map<string, DispenserBase & { nozzles: TankNozzle[] }>();
  for (const nozzle of nozzles) {
    if (!map.has(nozzle.dispenserId)) {
      map.set(nozzle.dispenserId, { ...nozzle.dispenser, nozzles: [] });
    }
    map.get(nozzle.dispenserId)!.nozzles.push(nozzle);
  }
  return Array.from(map.values());
}

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
          <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((pt) => (
                <SelectItem key={pt} value={pt}>{PRODUCT_LABELS[pt]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  tankId,
  onSuccess,
  onCancel,
}: {
  dispenserId: string;
  tankId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [productType, setProductType] = useState<ProductType>("MS");
  const [nozzleNumber, setNozzleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nozzleNumber.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addNozzle(dispenserId, { nozzleNumber: Number(nozzleNumber), productType, tankId });
      setNozzleNumber("");
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
        <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_TYPES.map((pt) => (
              <SelectItem key={pt} value={pt}>{PRODUCT_LABELS[pt]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1">
        <Label className="text-xs">Nozzle number</Label>
        <Input
          type="number"
          min="1"
          step="1"
          value={nozzleNumber}
          onChange={(e) => setNozzleNumber(e.target.value)}
          placeholder="e.g. 1"
          className="h-8 text-sm w-24"
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
  const [actionError, setActionError] = useState("");

  type PendingDelete =
    | { kind: "tank"; id: string }
    | { kind: "dispenser"; id: string }
    | { kind: "nozzle"; dispenserId: string; nozzleId: string };

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError("");
    try {
      if (pendingDelete.kind === "tank") {
        await deleteTank(pendingDelete.id);
      } else if (pendingDelete.kind === "dispenser") {
        await deleteDispenser(pendingDelete.id);
      } else {
        await deleteNozzle(pendingDelete.dispenserId, pendingDelete.nozzleId);
      }
      setPendingDelete(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  const deleteDialogProps = pendingDelete
    ? pendingDelete.kind === "tank"
      ? { title: "Delete tank?", description: "This will permanently delete the tank and all its dispensers and nozzles." }
      : pendingDelete.kind === "dispenser"
        ? { title: "Delete dispenser?", description: "This will permanently delete the dispenser and all its nozzles." }
        : { title: "Delete nozzle?", description: "This nozzle will be permanently removed." }
    : null;

  return (
    <>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={deleteDialogProps?.title ?? ""}
        description={deleteDialogProps?.description}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <NavLink
            to="/settings"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1 no-underline"
          >
            <ChevronLeft size={12} />
            Settings
          </NavLink>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
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
            const dispensers = groupNozzlesByDispenser(tank.nozzles);

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
                      onClick={() => setPendingDelete({ kind: "tank", id: tank.id })}
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
                    {dispensers.length === 0 && dispenserTankId !== tank.id && (
                      <p className="text-xs text-muted-foreground">No dispensers assigned to this tank.</p>
                    )}

                    {dispensers.map((dispenser) => (
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
                            onClick={() => setPendingDelete({ kind: "dispenser", id: dispenser.id })}
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
                                <span className="font-medium">#{nozzle.nozzleNumber}</span>
                                <span className="text-muted-foreground ml-1.5">
                                  {PRODUCT_LABELS[nozzle.productType]}
                                </span>
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete({ kind: "nozzle", dispenserId: dispenser.id, nozzleId: nozzle.id })}
                                aria-label="Delete nozzle"
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          ))}

                          {nozzleDispenserId === dispenser.id ? (
                            <AddNozzleForm
                              dispenserId={dispenser.id}
                              tankId={tank.id}
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
