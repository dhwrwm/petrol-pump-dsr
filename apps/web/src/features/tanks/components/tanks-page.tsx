import { Droplets, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { useTanks } from "../hooks/use-tanks";

export function TanksPage() {
  const { tanks, isPending, error, refetch } = useTanks();

  const totalCapacity = tanks.reduce((sum, t) => sum + Number(t.capacity), 0);
  const totalStock = tanks.reduce((sum, t) => sum + Number(t.currentDip), 0);
  const overallLevel =
    totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;

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
        </div>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section
        className="grid grid-cols-[repeat(4,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Tank summary"
      >
        {[
          { label: "Total tanks", value: String(tanks.length) },
          {
            label: "Total stock",
            value: `${totalStock.toLocaleString("en-IN")} L`,
          },
          {
            label: "Total capacity",
            value: `${totalCapacity.toLocaleString("en-IN")} L`,
          },
          { label: "Overall level", value: `${overallLevel}%` },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">
                <Droplets size={20} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">
                {metric.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </section>

      {tanks.length === 0 && !isPending ? (
        <div className="grid gap-2 justify-items-center content-center min-h-[60vh] text-muted-foreground">
          <Droplets size={32} />
          <p className="text-sm">No tanks configured yet.</p>
        </div>
      ) : (
        <Card className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-bold">All tanks</CardTitle>
            <CardAction>
              <span className="text-xs text-muted-foreground">
                {isPending ? "Loading..." : `${tanks.length} tanks`}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid gap-4">
              {tanks.map((tank) => {
                const capacity = Number(tank.capacity);
                const dip = Number(tank.currentDip);
                const level =
                  capacity > 0 ? Math.round((dip / capacity) * 100) : 0;

                return (
                  <article className="flex flex-col gap-2.5" key={tank.id}>
                    <div>
                      <strong>{tank.name}</strong>
                      <p className="text-xs text-muted-foreground">
                        {tank.product.name} · {dip.toLocaleString("en-IN")} /{" "}
                        {capacity.toLocaleString("en-IN")} L · {level}%
                      </p>
                    </div>
                    <div
                      className="h-2.5 rounded-full bg-muted overflow-hidden"
                      aria-label={`${tank.name} level ${level}%`}
                    >
                      <span
                        className="block h-full bg-primary rounded-full"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
