import { Building2, Fuel, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
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
    <main className="setupShell">
      <aside className="setupIntro">
        <div className="brand">
          <Fuel size={24} />
          <span>DSR</span>
        </div>
        <p className="eyebrow">Station setup</p>
        <h1>Set the station and opening inventory</h1>
        <p>
          The first tanks become the inventory baseline for sales, dip checks,
          and later delivery movements.
        </p>
      </aside>

      <section className="setupPanel" aria-labelledby="setup-title">
        <header className="setupHeader">
          <Building2 size={22} />
          <div>
            <h2 id="setup-title">Station details</h2>
            <p>Create the station before starting the first shift.</p>
          </div>
        </header>

        <form className="setupForm" onSubmit={handleSubmit}>
          <div className="setupFields">
            <label>
              Organization
              <input
                name="organizationName"
                required
                placeholder="Petrol Pump Group"
              />
            </label>
            <label>
              GSTIN
              <input name="gstin" placeholder="Optional" />
            </label>
            <label>
              Station name
              <input name="stationName" required placeholder="BLR Ring Road" />
            </label>
            <label>
              Station code
              <input name="stationCode" required placeholder="BLR-07" />
            </label>
            <label className="setupWide">
              Address
              <input name="address" placeholder="Optional station address" />
            </label>
          </div>

          <section
            className="inventorySetup"
            aria-label="Opening tank inventory"
          >
            <div className="panelHeader">
              <h2>Opening tanks</h2>
              <button type="button" onClick={addTank}>
                <Plus size={17} />
                Add tank
              </button>
            </div>
            <div className="tankSetupList">
              {tanks.map((tank, index) => (
                <article className="tankSetup" key={`${tank.name}-${index}`}>
                  <label>
                    Tank name
                    <input
                      required
                      value={tank.name}
                      onChange={(event) =>
                        updateTank(index, { name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Fuel
                    <select
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
                  <label>
                    Capacity liters
                    <input
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
                  <label>
                    Opening dip
                    <input
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
                  <button
                    className="iconButton"
                    disabled={tanks.length === 1}
                    onClick={() => removeTank(index)}
                    type="button"
                    aria-label={`Remove ${tank.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          {message || statusError ? (
            <p className="authMessage" role="alert">
              {message || statusError}
            </p>
          ) : null}

          <button className="setupSubmit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save station setup"}
          </button>
        </form>
      </section>
    </main>
  );
}
