import { Building2, Fuel, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStationSetup } from "../api/setup.api";
import {
  PRODUCT_LABELS,
  type DispenserSetupInput,
  type NozzleSetupInput,
  type ProductType,
  type StationSetupState,
  type TankSetupInput,
} from "../types/setup.types";

const PRODUCT_TYPES: ProductType[] = ["MS", "HSD", "XP95", "OTHERS"];

const STEPS = ["Station", "Tanks", "Dispensers", "Nozzles"] as const;

const defaultTank: TankSetupInput = { productType: "MS", capacity: "", currentDip: "" };
const defaultDispenser: DispenserSetupInput = { companyName: "", serialNo: "" };

function mkNozzle(tanks: TankSetupInput[]): NozzleSetupInput {
  return {
    nozzleNumber: "1",
    productType: tanks[0]?.productType ?? "MS",
    tankIndex: 0,
    dispenserIndex: 0,
  };
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${
              i <= current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-sm font-medium mr-1 ${
              i === current ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`w-6 h-px mr-1 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

type StationSetupPageProps = {
  statusError?: string;
  onConfigured: (state: StationSetupState) => void;
};

// ── Main component ────────────────────────────────────────────────────────────

export function StationSetupPage({ statusError, onConfigured }: StationSetupPageProps) {
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 0 — Station
  const [orgName, setOrgName] = useState("");
  const [gstin, setGstin] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationCode, setStationCode] = useState("");
  const [address, setAddress] = useState("");

  // Step 1 — Tanks
  const [tanks, setTanks] = useState<TankSetupInput[]>([{ ...defaultTank }]);

  // Step 2 — Dispensers
  const [dispensers, setDispensers] = useState<DispenserSetupInput[]>([]);

  // Step 3 — Nozzles
  const [nozzles, setNozzles] = useState<NozzleSetupInput[]>([]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  function validateAndNext() {
    setStepError("");

    if (step === 0) {
      if (!orgName.trim()) return setStepError("Organization name is required.");
      if (!stationName.trim()) return setStepError("Station name is required.");
      if (!stationCode.trim()) return setStepError("Station code is required.");
    }

    if (step === 1) {
      if (tanks.length === 0) return setStepError("Add at least one tank.");
      for (let i = 0; i < tanks.length; i++) {
        const t = tanks[i];
        if (!t.capacity || Number(t.capacity) <= 0)
          return setStepError(`Tank ${i + 1}: capacity must be greater than zero.`);
        if (t.currentDip === "" || Number(t.currentDip) < 0)
          return setStepError(`Tank ${i + 1}: opening dip cannot be negative.`);
        if (Number(t.currentDip) > Number(t.capacity))
          return setStepError(`Tank ${i + 1}: opening dip cannot exceed capacity.`);
      }
    }

    if (step === 2) {
      for (let i = 0; i < dispensers.length; i++) {
        if (!dispensers[i].companyName.trim())
          return setStepError(`Dispenser ${i + 1}: company name is required.`);
      }
    }

    setStep((s) => s + 1);
  }

  function goBack() {
    setStepError("");
    setStep((s) => s - 1);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setStepError("");
    setSubmitError("");

    for (let i = 0; i < nozzles.length; i++) {
      const n = nozzles[i];
      if (!n.nozzleNumber || Number(n.nozzleNumber) < 1)
        return setStepError(`Nozzle ${i + 1}: nozzle number must be at least 1.`);
    }

    setIsSubmitting(true);
    try {
      const result = await createStationSetup({
        organizationName: orgName.trim(),
        gstin: gstin.trim() || undefined,
        stationName: stationName.trim(),
        stationCode: stationCode.trim(),
        address: address.trim() || undefined,
        tanks,
        dispensers,
        nozzles: nozzles.map((n) => ({
          nozzleNumber: Number(n.nozzleNumber),
          productType: n.productType,
          tankIndex: n.tankIndex,
          dispenserIndex: n.dispenserIndex,
        })),
      });
      onConfigured(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to save station setup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Tank helpers ────────────────────────────────────────────────────────────

  function updateTank(i: number, patch: Partial<TankSetupInput>) {
    setTanks((ts) => ts.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTank() {
    setTanks((ts) => [...ts, { ...defaultTank }]);
  }
  function removeTank(i: number) {
    if (tanks.length === 1) return;
    setTanks((ts) => ts.filter((_, idx) => idx !== i));
    // Fix nozzle tankIndex references
    setNozzles((ns) =>
      ns
        .filter((n) => n.tankIndex !== i)
        .map((n) => ({ ...n, tankIndex: n.tankIndex > i ? n.tankIndex - 1 : n.tankIndex })),
    );
  }

  // ── Dispenser helpers ────────────────────────────────────────────────────────

  function updateDispenser(i: number, patch: Partial<DispenserSetupInput>) {
    setDispensers((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
  function addDispenser() {
    setDispensers((ds) => [...ds, { ...defaultDispenser }]);
  }
  function removeDispenser(i: number) {
    setDispensers((ds) => ds.filter((_, idx) => idx !== i));
    setNozzles((ns) =>
      ns
        .filter((n) => n.dispenserIndex !== i)
        .map((n) => ({
          ...n,
          dispenserIndex: n.dispenserIndex > i ? n.dispenserIndex - 1 : n.dispenserIndex,
        })),
    );
  }

  // ── Nozzle helpers ───────────────────────────────────────────────────────────

  function updateNozzle(i: number, patch: Partial<NozzleSetupInput>) {
    setNozzles((ns) => ns.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  }
  function addNozzle() {
    setNozzles((ns) => [...ns, mkNozzle(tanks)]);
  }
  function removeNozzle(i: number) {
    setNozzles((ns) => ns.filter((_, idx) => idx !== i));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className="grid grid-cols-[minmax(260px,0.72fr)_minmax(640px,1.28fr)] min-h-screen bg-background max-md:grid-cols-1">
      {/* Brand aside */}
      <aside className="grid content-start gap-4 p-[clamp(24px,4vw,54px)] bg-brand-900 text-brand-50">
        <div className="flex items-center gap-2.5 text-xl font-extrabold mb-[clamp(40px,10vh,110px)] max-md:mb-4">
          <Fuel size={24} />
          <span>DSR</span>
        </div>
        <p className="text-xs font-bold uppercase text-[#9ac4b3] tracking-wide">Station setup</p>
        <h1 className="max-w-[440px] text-[42px] leading-tight max-md:text-[34px]">
          Set the station and opening inventory
        </h1>
        <p className="max-w-[430px] text-[#d5e0db] leading-relaxed">
          Register your organization, add tanks, dispensers, and nozzles to start tracking daily sales.
        </p>
      </aside>

      {/* Form area */}
      <section className="grid content-start gap-5 p-[clamp(24px,4vw,54px)]">
        <StepIndicator current={step} />

        {/* Step 0 — Station */}
        {step === 0 && (
          <div className="grid gap-5">
            <header className="flex items-center gap-3.5 text-primary">
              <Building2 size={22} />
              <div>
                <h2 className="text-[26px] font-bold text-foreground">Station details</h2>
                <p className="mt-1 text-muted-foreground">Create the organization and station.</p>
              </div>
            </header>

            <div className="grid grid-cols-[repeat(2,minmax(220px,1fr))] gap-3.5 max-md:grid-cols-1">
              <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                Organization name <span className="text-destructive">*</span>
                <Input
                  value={orgName}
                  onChange={(e) => { setOrgName(e.target.value); setStepError(""); }}
                  placeholder="Petrol Pump Group"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                GSTIN
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                Station name <span className="text-destructive">*</span>
                <Input
                  value={stationName}
                  onChange={(e) => { setStationName(e.target.value); setStepError(""); }}
                  placeholder="BLR Ring Road"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                Station code <span className="text-destructive">*</span>
                <Input
                  value={stationCode}
                  onChange={(e) => { setStationCode(e.target.value); setStepError(""); }}
                  placeholder="BLR-07"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-muted-foreground col-span-full">
                Address
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Optional station address"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 1 — Tanks */}
        {step === 1 && (
          <div className="grid gap-5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[26px] font-bold text-foreground">Tanks</h2>
                <p className="mt-1 text-muted-foreground">Add the fuel tanks at this station.</p>
              </div>
              <Button type="button" size="sm" onClick={addTank}>
                <Plus size={16} />
                Add tank
              </Button>
            </header>

            <div className="grid gap-2.5">
              {tanks.map((tank, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_36px] items-end gap-2.5 p-3.5 border rounded-lg bg-card max-md:grid-cols-1"
                >
                  <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                    Product type
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={tank.productType}
                      onChange={(e) => updateTank(i, { productType: e.target.value as ProductType })}
                    >
                      {PRODUCT_TYPES.map((pt) => (
                        <option key={pt} value={pt}>{PRODUCT_LABELS[pt]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                    Capacity (L)
                    <Input
                      type="number"
                      min="0.001"
                      step="0.001"
                      placeholder="e.g. 10000"
                      value={tank.capacity}
                      onChange={(e) => { updateTank(i, { capacity: e.target.value }); setStepError(""); }}
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                    Opening dip (L)
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="e.g. 4500"
                      value={tank.currentDip}
                      onChange={(e) => { updateTank(i, { currentDip: e.target.value }); setStepError(""); }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9"
                    disabled={tanks.length === 1}
                    onClick={() => removeTank(i)}
                    aria-label={`Remove tank ${i + 1}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Dispensers */}
        {step === 2 && (
          <div className="grid gap-5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[26px] font-bold text-foreground">Dispensers</h2>
                <p className="mt-1 text-muted-foreground">
                  Add the fuel dispensing units. You can skip this and add them later in Inventory Management.
                </p>
              </div>
              <Button type="button" size="sm" onClick={addDispenser}>
                <Plus size={16} />
                Add dispenser
              </Button>
            </header>

            {dispensers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground border rounded-lg bg-muted/30">
                <p className="text-sm">No dispensers added. Click "Add dispenser" or skip to the next step.</p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {dispensers.map((d, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_36px] items-end gap-2.5 p-3.5 border rounded-lg bg-card max-md:grid-cols-1"
                  >
                    <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                      Company name <span className="text-destructive">*</span>
                      <Input
                        placeholder="e.g. Tatsuno"
                        value={d.companyName}
                        onChange={(e) => { updateDispenser(i, { companyName: e.target.value }); setStepError(""); }}
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                      Serial no.
                      <Input
                        placeholder="Optional"
                        value={d.serialNo}
                        onChange={(e) => updateDispenser(i, { serialNo: e.target.value })}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9"
                      onClick={() => removeDispenser(i)}
                      aria-label={`Remove dispenser ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Nozzles */}
        {step === 3 && (
          <div className="grid gap-5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[26px] font-bold text-foreground">Nozzles</h2>
                <p className="mt-1 text-muted-foreground">
                  Link nozzles to a tank and dispenser. You can add more later.
                </p>
              </div>
              {dispensers.length > 0 && tanks.length > 0 && (
                <Button type="button" size="sm" onClick={addNozzle}>
                  <Plus size={16} />
                  Add nozzle
                </Button>
              )}
            </header>

            {(dispensers.length === 0 || tanks.length === 0) ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground border rounded-lg bg-muted/30">
                <p className="text-sm">
                  {tanks.length === 0
                    ? "Go back and add at least one tank before adding nozzles."
                    : "No dispensers defined — go back to add dispensers first, or save and add nozzles later."}
                </p>
              </div>
            ) : nozzles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground border rounded-lg bg-muted/30">
                <p className="text-sm">No nozzles added. Click "Add nozzle" or save the setup without nozzles.</p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {nozzles.map((n, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[80px_1fr_1fr_1fr_36px] items-end gap-2.5 p-3.5 border rounded-lg bg-card max-md:grid-cols-1"
                  >
                    <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                      No.
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        value={n.nozzleNumber}
                        onChange={(e) => { updateNozzle(i, { nozzleNumber: e.target.value }); setStepError(""); }}
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                      Product
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={n.productType}
                        onChange={(e) => updateNozzle(i, { productType: e.target.value as ProductType })}
                      >
                        {PRODUCT_TYPES.map((pt) => (
                          <option key={pt} value={pt}>{PRODUCT_LABELS[pt]}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                      Tank
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={n.tankIndex}
                        onChange={(e) => updateNozzle(i, { tankIndex: Number(e.target.value) })}
                      >
                        {tanks.map((t, ti) => (
                          <option key={ti} value={ti}>
                            Tank {ti + 1} – {PRODUCT_LABELS[t.productType]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-sm font-bold text-muted-foreground">
                      Dispenser
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={n.dispenserIndex}
                        onChange={(e) => updateNozzle(i, { dispenserIndex: Number(e.target.value) })}
                      >
                        {dispensers.map((d, di) => (
                          <option key={di} value={di}>
                            {di + 1}. {d.companyName || `Dispenser ${di + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9"
                      onClick={() => removeNozzle(i)}
                      aria-label={`Remove nozzle ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Errors */}
        {(stepError || submitError || statusError) && (
          <Alert variant="destructive">
            <AlertDescription>{stepError || submitError || statusError}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex gap-2.5">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          {step < 3 && (
            <Button type="button" onClick={validateAndNext}>
              Next
            </Button>
          )}
          {step === 3 && (
            <Button
              type="button"
              className="font-extrabold h-11"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Saving…" : "Save setup"}
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
