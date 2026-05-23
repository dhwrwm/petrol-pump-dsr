import {
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useTanks } from "../../tanks/hooks/use-tanks";
import {
  createDispenser,
  deleteDispenser,
  updateTankDip,
} from "../api/settings.api";
import { useDispensers } from "../hooks/use-dispensers";
import type { NozzleInput } from "../types/settings.types";

const initialNozzle: NozzleInput = { label: "", tankId: "" };

export function SettingsPage() {
  const {
    dispensers,
    isPending: dispensersPending,
    error: dispensersError,
    refetch: refetchDispensers,
  } = useDispensers();
  const {
    tanks,
    isPending: tanksPending,
    error: tanksError,
    refetch: refetchTanks,
  } = useTanks();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSerialNo, setFormSerialNo] = useState("");
  const [formNozzles, setFormNozzles] = useState<NozzleInput[]>([
    { ...initialNozzle },
  ]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dipValues, setDipValues] = useState<Record<string, string>>({});
  const [dipSaving, setDipSaving] = useState<Record<string, boolean>>({});
  const [dipError, setDipError] = useState("");

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateNozzle(index: number, patch: Partial<NozzleInput>) {
    setFormNozzles((current) =>
      current.map((n, i) => (i === index ? { ...n, ...patch } : n)),
    );
  }

  function addNozzleRow() {
    setFormNozzles((current) => [...current, { ...initialNozzle }]);
  }

  function removeNozzleRow(index: number) {
    setFormNozzles((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index),
    );
  }

  async function handleAddDispenser(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      await createDispenser({
        name: formName,
        serialNo: formSerialNo || undefined,
        nozzles: formNozzles,
      });

      setFormName("");
      setFormSerialNo("");
      setFormNozzles([{ ...initialNozzle }]);
      setShowAddForm(false);
      refetchDispensers();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to create dispenser.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(dispenserId: string) {
    try {
      await deleteDispenser(dispenserId);
      refetchDispensers();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to delete dispenser.",
      );
    }
  }

  async function handleDipSave(tankId: string) {
    const value = dipValues[tankId];
    if (value === undefined || value === "") return;

    setDipSaving((prev) => ({ ...prev, [tankId]: true }));
    setDipError("");

    try {
      await updateTankDip(tankId, value);
      setDipValues((prev) => {
        const next = { ...prev };
        delete next[tankId];
        return next;
      });
      refetchTanks();
    } catch (err) {
      setDipError(
        err instanceof Error ? err.message : "Unable to update dip reading.",
      );
    } finally {
      setDipSaving((prev) => ({ ...prev, [tankId]: false }));
    }
  }

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Configuration
          </p>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh"
            onClick={() => {
              refetchDispensers();
              refetchTanks();
            }}
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </header>

      {(dispensersError || tanksError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {dispensersError || tanksError}
          </AlertDescription>
        </Alert>
      )}

      {/* Dispensers & Nozzles */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg font-bold">
            Dispensers &amp; Nozzles
          </CardTitle>
          <CardAction>
            <Button
              size="sm"
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={17} />
              Add dispenser
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {showAddForm && (
            <form
              className="grid gap-3.5 p-4 border border-border rounded-lg bg-muted/40 mb-4"
              onSubmit={handleAddDispenser}
            >
              <div className="grid grid-cols-[repeat(2,minmax(220px,1fr))] gap-3.5 max-md:grid-cols-1">
                <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                  Dispenser name
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Dispenser 1"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                  Serial no.
                  <Input
                    value={formSerialNo}
                    onChange={(e) => setFormSerialNo(e.target.value)}
                    placeholder="Optional"
                  />
                </label>
              </div>

              <div className="flex justify-between items-center mt-3.5">
                <h3 className="text-base font-bold">Nozzles</h3>
                <Button type="button" size="sm" onClick={addNozzleRow}>
                  <Plus size={17} />
                  Add nozzle
                </Button>
              </div>

              {formNozzles.map((nozzle, index) => (
                <div
                  className="flex items-end gap-2.5 py-2.5 border-b border-border max-md:flex-col max-md:items-stretch"
                  key={index}
                >
                  <label className="flex-1 grid gap-2 text-sm font-bold text-muted-foreground">
                    Nozzle label
                    <Input
                      required
                      value={nozzle.label}
                      onChange={(e) =>
                        updateNozzle(index, { label: e.target.value })
                      }
                      placeholder="Nozzle A"
                    />
                  </label>
                  <label className="flex-1 grid gap-2 text-sm font-bold text-muted-foreground">
                    Tank
                    <select
                      className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-foreground"
                      required
                      value={nozzle.tankId}
                      onChange={(e) =>
                        updateNozzle(index, { tankId: e.target.value })
                      }
                    >
                      <option value="">Select tank</option>
                      {tanks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.product.name})
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 max-md:self-end"
                    type="button"
                    disabled={formNozzles.length === 1}
                    onClick={() => removeNozzleRow(index)}
                    aria-label={`Remove nozzle ${index + 1}`}
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>
              ))}

              <Button
                className="justify-self-start h-10 font-extrabold"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save dispenser"}
              </Button>
            </form>
          )}

          {dispensersPending ? (
            <p className="text-sm text-muted-foreground">
              Loading dispensers...
            </p>
          ) : dispensers.length === 0 ? (
            <div className="grid gap-2 justify-items-center content-center min-h-[20vh] text-muted-foreground">
              <Settings size={28} />
              <p className="text-sm">No dispensers configured yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Nozzles</TableHead>
                  <TableHead className="max-md:hidden" />
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispensers.map((d) => (
                  <>
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(d.id)}
                    >
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          {expanded.has(d.id) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                          <strong>{d.name}</strong>
                        </span>
                      </TableCell>
                      <TableCell>{d.serialNo || "—"}</TableCell>
                      <TableCell>
                        {d.nozzles.length} nozzle
                        {d.nozzles.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="max-md:hidden" />
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          type="button"
                          aria-label={`Delete ${d.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(d.id);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expanded.has(d.id) &&
                      d.nozzles.map((n) => (
                        <TableRow
                          key={n.id}
                          className="bg-muted/30 text-sm text-muted-foreground"
                        >
                          <TableCell className="pl-8">
                            {n.label}
                          </TableCell>
                          <TableCell>{n.tank.name}</TableCell>
                          <TableCell>{n.tank.product.name}</TableCell>
                          <TableCell className="max-md:hidden">
                            Meter:{" "}
                            {Number(n.openingMeter).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tank Dip Readings */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-lg font-bold">
            Tank Dip Readings
          </CardTitle>
          <CardAction>
            <span className="text-xs text-muted-foreground">
              {tanksPending ? "Loading..." : `${tanks.length} tanks`}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4">
          {dipError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{dipError}</AlertDescription>
            </Alert>
          )}

          {tanks.length === 0 && !tanksPending ? (
            <div className="grid gap-2 justify-items-center content-center min-h-[20vh] text-muted-foreground">
              <Settings size={28} />
              <p className="text-sm">No tanks configured yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Current dip</TableHead>
                  <TableHead>New dip</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tanks.map((tank) => {
                  const isSaving = dipSaving[tank.id] ?? false;
                  const editValue = dipValues[tank.id];

                  return (
                    <TableRow key={tank.id}>
                      <TableCell>
                        <strong>{tank.name}</strong>
                      </TableCell>
                      <TableCell>{tank.product.name}</TableCell>
                      <TableCell>
                        {Number(tank.currentDip).toLocaleString("en-IN")} /{" "}
                        {Number(tank.capacity).toLocaleString("en-IN")} L
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={tank.capacity}
                          step="0.001"
                          placeholder={tank.currentDip}
                          value={editValue ?? ""}
                          onChange={(e) =>
                            setDipValues((prev) => ({
                              ...prev,
                              [tank.id]: e.target.value,
                            }))
                          }
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          type="button"
                          disabled={
                            isSaving ||
                            editValue === undefined ||
                            editValue === ""
                          }
                          aria-label={`Save dip for ${tank.name}`}
                          onClick={() => handleDipSave(tank.id)}
                        >
                          <Save size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
