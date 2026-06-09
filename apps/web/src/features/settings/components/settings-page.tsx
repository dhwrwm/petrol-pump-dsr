import { Check, ChevronRight, Droplets, Settings } from "lucide-react";
import { useState } from "react";
import { NavLink, useOutletContext } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateStationSettings } from "../../setup/api/setup.api";
import type { LayoutContext } from "../../../components/protected-layout";

const SHIFT_OPTIONS = [1, 2, 3, 4] as const;

export function SettingsPage() {
  const { station } = useOutletContext<LayoutContext>();

  const [shiftsPerDay, setShiftsPerDay] = useState(station.shiftsPerDay ?? 2);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSaveShifts() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateStationSettings({ shiftsPerDay });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header>
        <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
          Configuration
        </p>
        <h1 className="text-3xl font-bold">Settings</h1>
      </header>

      {/* Navigation cards */}
      <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        <NavLink
          to="/settings/inventory"
          className="no-underline group flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Droplets size={20} className="text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary">
              Inventory Management
            </p>
            <p className="text-xs text-muted-foreground">Tanks, dispensers &amp; nozzles</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary" />
        </NavLink>
      </section>

      {/* General settings */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Settings size={18} className="text-muted-foreground" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 grid gap-6">
          {/* Shifts per day */}
          <div className="grid gap-3">
            <div>
              <p className="text-sm font-semibold">Shifts per day</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                How many shifts run at this station each day. Controls shift scheduling and reporting.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SHIFT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setShiftsPerDay(n); setSaved(false); }}
                  className={`flex items-center justify-center w-14 h-10 rounded-lg border text-sm font-bold transition-colors ${
                    shiftsPerDay === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"
                  }`}
                  aria-pressed={shiftsPerDay === n}
                >
                  {n}
                </button>
              ))}
              <span className="self-center text-sm text-muted-foreground ml-1">
                {shiftsPerDay === 1 ? "shift" : "shifts"} / day
              </span>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={saving || shiftsPerDay === (station.shiftsPerDay ?? 2)}
                onClick={handleSaveShifts}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <Check size={14} />
                  Saved
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
