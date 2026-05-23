import { useState } from "react";
import { HardHat, Plus, RefreshCw, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePumpBoys } from "../hooks/use-pump-boys";
import {
  createPumpBoy,
  deletePumpBoy,
  updatePumpBoy,
} from "../api/pump-boys.api";

export function PumpBoysPage() {
  const { pumpBoys, isPending, error, refetch } = usePumpBoys();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = pumpBoys.filter((p) => p.isActive).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      await createPumpBoy({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      setName("");
      setPhone("");
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add pump boy.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      await updatePumpBoy(id, { isActive: !currentActive });
      refetch();
    } catch {
      // silently refetch to show current state
      refetch();
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePumpBoy(id);
      refetch();
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to delete pump boy.",
      );
    }
  }

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Staff
          </p>
          <h1 className="text-3xl font-bold">Pump Boys</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh pump boys"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
          <Button type="button" onClick={() => setShowForm((s) => !s)}>
            <Plus size={18} />
            Add
          </Button>
        </div>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card className="py-4">
          <CardContent className="px-4">
            <form onSubmit={handleAdd} className="flex gap-3 items-end flex-wrap">
              <div className="grid gap-1.5 flex-1 min-w-[180px]">
                <label htmlFor="pb-name" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  id="pb-name"
                  placeholder="Pump boy name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5 flex-1 min-w-[180px]">
                <label htmlFor="pb-phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="pb-phone"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add pump boy"}
              </Button>
            </form>
            {formError && (
              <p className="text-sm text-destructive mt-2">{formError}</p>
            )}
          </CardContent>
        </Card>
      )}

      <section
        className="grid grid-cols-[repeat(2,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Pump boys summary"
      >
        {[
          { label: "Total pump boys", value: String(pumpBoys.length) },
          { label: "Active pump boys", value: String(activeCount) },
        ].map((metric) => (
          <Card key={metric.label} className="py-4">
            <CardContent className="px-4">
              <div className="text-primary mb-4">
                <HardHat size={20} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <strong className="block mt-1.5 text-xl font-bold">
                {metric.value}
              </strong>
            </CardContent>
          </Card>
        ))}
      </section>

      {pumpBoys.length === 0 && !isPending ? (
        <div className="grid gap-2 justify-items-center content-center min-h-[60vh] text-muted-foreground">
          <HardHat size={32} />
          <p className="text-sm">No pump boys registered yet.</p>
        </div>
      ) : (
        <Card className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-bold">Pump boys</CardTitle>
            <CardAction>
              <span className="text-xs text-muted-foreground">
                {isPending ? "Loading..." : `${pumpBoys.length} pump boys`}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pumpBoys.map((pumpBoy) => (
                  <TableRow key={pumpBoy.id}>
                    <TableCell>{pumpBoy.name}</TableCell>
                    <TableCell>{pumpBoy.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={pumpBoy.isActive ? "default" : "secondary"}
                      >
                        {pumpBoy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() =>
                            handleToggleActive(pumpBoy.id, pumpBoy.isActive)
                          }
                        >
                          {pumpBoy.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          aria-label={`Delete ${pumpBoy.name}`}
                          onClick={() => handleDelete(pumpBoy.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
