import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCreditCustomer } from "../api/credit.api";

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

export function CreditorForm({ onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createCreditCustomer({
        name,
        phone: phone || undefined,
        vehicleNo: vehicleNo || undefined,
        creditLimit: creditLimit || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <h2 className="text-lg font-semibold mb-4">New Creditor</h2>
      <form
        onSubmit={(e) => { void handleSubmit(e); }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="Customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vehicle no. <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              placeholder="e.g. KA01AB1234"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Credit limit (₹) <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Creditor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
