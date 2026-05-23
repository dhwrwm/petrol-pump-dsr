import { Building2, Fuel, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStationSetup } from "../api/setup.api";
import {
  type FuelGrade,
  type StationSetupState,
  type TankSetupInput,
} from "../types/setup.types";

const fuelGrades: Array<{ label: string; value: FuelGrade }> = [
  { label: "Petrol", value: "PETROL" },
  { label: "Diesel", value: "DIESEL" },
  { label: "Premium petrol", value: "PREMIUM_PETROL" },
  { label: "CNG", value: "CNG" },
];

const initialTank: TankSetupInput = {
  name: "Tank 1",
  grade: "PETROL",
  capacity: "",
  currentDip: "",
};

type StationSetupPageProps = {
  statusError?: string;
  onConfigured: (state: StationSetupState) => void;
};

export function StationSetupPage({
  statusError,
  onConfigured,
}: StationSetupPageProps) {
  const [tanks, setTanks] = useState<TankSetupInput[]>([initialTank]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      const setupState = await createStationSetup({
        organizationName: String(form.get("organizationName") ?? ""),
        gstin: String(form.get("gstin") ?? ""),
        stationName: String(form.get("stationName") ?? ""),
        stationCode: String(form.get("stationCode") ?? ""),
        address: String(form.get("address") ?? ""),
        tanks,
      });

      onConfigured(setupState);
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save station setup.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateTank(index: number, patch: Partial<TankSetupInput>) {
    setTanks((currentTanks) =>
      currentTanks.map((tank, tankIndex) =>
        tankIndex === index ? { ...tank, ...patch } : tank,
      ),
    );
  }

  function addTank() {
    setTanks((currentTanks) => [
      ...currentTanks,
      {
        ...initialTank,
        name: `Tank ${currentTanks.length + 1}`,
      },
    ]);
  }

  function removeTank(index: number) {
    setTanks((currentTanks) =>
      currentTanks.length === 1
        ? currentTanks
        : currentTanks.filter((_, tankIndex) => tankIndex !== index),
    );
  }

  return (
    <main className="grid grid-cols-[minmax(260px,0.72fr)_minmax(640px,1.28fr)] min-h-screen bg-background max-md:grid-cols-1">
      <aside className="grid content-start gap-4 p-[clamp(24px,4vw,54px)] bg-brand-900 text-brand-50">
        <div className="flex items-center gap-2.5 text-xl font-extrabold mb-[clamp(40px,10vh,110px)] max-md:mb-4">
          <Fuel size={24} />
          <span>DSR</span>
        </div>
        <p className="text-xs font-bold uppercase text-[#9ac4b3] tracking-wide">
          Station setup
        </p>
        <h1 className="max-w-[440px] text-[42px] leading-tight max-md:text-[34px]">
          Set the station and opening inventory
        </h1>
        <p className="max-w-[430px] text-[#d5e0db] leading-relaxed">
          The first tanks become the inventory baseline for sales, dip checks,
          and later delivery movements.
        </p>
      </aside>

      <section
        className="grid content-start gap-5 p-[clamp(24px,4vw,54px)]"
        aria-labelledby="setup-title"
      >
        <header className="flex items-center gap-3.5 text-primary">
          <Building2 size={22} />
          <div>
            <h2 id="setup-title" className="text-[26px] font-bold text-foreground">
              Station details
            </h2>
            <p className="mt-1 text-muted-foreground">
              Create the station before starting the first shift.
            </p>
          </div>
        </header>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[repeat(2,minmax(220px,1fr))] gap-3.5 max-md:grid-cols-1">
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Organization
              <Input
                name="organizationName"
                required
                placeholder="Petrol Pump Group"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              GSTIN
              <Input name="gstin" placeholder="Optional" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Station name
              <Input name="stationName" required placeholder="BLR Ring Road" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground">
              Station code
              <Input name="stationCode" required placeholder="BLR-07" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-muted-foreground col-span-full">
              Address
              <Input name="address" placeholder="Optional station address" />
            </label>
          </div>

          <section className="grid gap-3.5" aria-label="Opening tank inventory">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Opening tanks</h2>
              <Button type="button" onClick={addTank} size="sm">
                <Plus size={17} />
                Add tank
              </Button>
            </div>
            <div className="grid gap-2.5">
              {tanks.map((tank, index) => (
                <article
                  className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,0.92fr)_minmax(126px,0.78fr)_minmax(126px,0.78fr)_42px] items-end gap-2.5 p-3.5 border border-border rounded-lg bg-card shadow-sm max-md:grid-cols-1"
                  key={`${tank.name}-${index}`}
                >
                  <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                    Tank name
                    <Input
                      required
                      value={tank.name}
                      onChange={(event) =>
                        updateTank(index, { name: event.target.value })
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                    Fuel
                    <select
                      className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-foreground"
                      value={tank.grade}
                      onChange={(event) =>
                        updateTank(index, {
                          grade: event.target.value as FuelGrade,
                        })
                      }
                    >
                      {fuelGrades.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                    Capacity liters
                    <Input
                      min="0.001"
                      required
                      step="0.001"
                      type="number"
                      value={tank.capacity}
                      onChange={(event) =>
                        updateTank(index, { capacity: event.target.value })
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-muted-foreground">
                    Opening dip
                    <Input
                      min="0"
                      required
                      step="0.001"
                      type="number"
                      value={tank.currentDip}
                      onChange={(event) =>
                        updateTank(index, { currentDip: event.target.value })
                      }
                    />
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9"
                    disabled={tanks.length === 1}
                    onClick={() => removeTank(index)}
                    type="button"
                    aria-label={`Remove ${tank.name}`}
                  >
                    <Trash2 size={17} />
                  </Button>
                </article>
              ))}
            </div>
          </section>

          {message || statusError ? (
            <Alert variant="destructive">
              <AlertDescription>{message || statusError}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="justify-self-start h-11 font-extrabold"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save station setup"}
          </Button>
        </form>
      </section>
    </main>
  );
}
