import { useState } from "react";
import { HardHat, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
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
import { createEmployee, deleteEmployee, updateEmployee } from "../api/employees.api";
import { useEmployees } from "../hooks/use-employees";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function EmployeesPage() {
  const { employees, isPending, error, refetch } = useEmployees();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [salary, setSalary] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = employees.filter((e) => e.isActive).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !designation.trim() || !joinedAt || !salary) {
      setFormError("Name, designation, join date, and salary are required.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      await createEmployee({
        name: name.trim(),
        phone: phone.trim() || undefined,
        designation: designation.trim(),
        joinedAt,
        salary: Number(salary),
      });
      setName("");
      setPhone("");
      setDesignation("");
      setJoinedAt("");
      setSalary("");
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add employee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    const resignedAt = current ? new Date().toISOString() : null;
    try {
      await updateEmployee(id, { isActive: !current, resignedAt });
      refetch();
    } catch {
      refetch();
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEmployee(id);
      refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete employee.");
    }
  }

  return (
    <>
      <header className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-start">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Staff
          </p>
          <h1 className="text-3xl font-bold">Employees</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="Refresh employees"
            onClick={refetch}
          >
            <RefreshCw size={18} />
          </Button>
          <Button type="button" onClick={() => setShowForm((s) => !s)}>
            <Plus size={18} />
            Add Employee
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
            <form onSubmit={handleAdd} className="grid gap-3">
              <div className="flex gap-3 flex-wrap">
                <div className="grid gap-1.5 flex-1 min-w-[180px]">
                  <label htmlFor="emp-name" className="text-sm font-medium">
                    Name *
                  </label>
                  <Input
                    id="emp-name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5 flex-1 min-w-[180px]">
                  <label
                    htmlFor="emp-designation"
                    className="text-sm font-medium"
                  >
                    Designation *
                  </label>
                  <Input
                    id="emp-designation"
                    placeholder="e.g. Manager, Accountant, Pump Boy"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5 flex-1 min-w-[180px]">
                  <label htmlFor="emp-phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="emp-phone"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap items-end">
                <div className="grid gap-1.5">
                  <label htmlFor="emp-joined" className="text-sm font-medium">
                    Date of Joining *
                  </label>
                  <Input
                    id="emp-joined"
                    type="date"
                    value={joinedAt}
                    onChange={(e) => setJoinedAt(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5 w-36">
                  <label htmlFor="emp-salary" className="text-sm font-medium">
                    Monthly Salary (₹) *
                  </label>
                  <Input
                    id="emp-salary"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Employee"}
                </Button>
              </div>
            </form>
            {formError && (
              <p className="text-sm text-destructive mt-2">{formError}</p>
            )}
          </CardContent>
        </Card>
      )}

      <section
        className="grid grid-cols-[repeat(2,minmax(150px,1fr))] gap-3.5 max-md:grid-cols-1"
        aria-label="Employee summary"
      >
        {[
          { label: "Total employees", value: String(employees.length) },
          { label: "Active employees", value: String(activeCount) },
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

      {employees.length === 0 && !isPending ? (
        <div className="grid gap-2 justify-items-center content-center min-h-[60vh] text-muted-foreground">
          <HardHat size={32} />
          <p className="text-sm">No employees registered yet.</p>
        </div>
      ) : (
        <Card className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-lg font-bold">Employees</CardTitle>
            <CardAction>
              <span className="text-xs text-muted-foreground">
                {isPending ? "Loading..." : `${employees.length} employees`}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>{emp.phone ?? "—"}</TableCell>
                    <TableCell>{formatDate(emp.joinedAt)}</TableCell>
                    <TableCell>
                      ₹{Number(emp.salary).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.isActive ? "default" : "secondary"}>
                        {emp.isActive ? "Active" : "Resigned"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() =>
                            handleToggleActive(emp.id, emp.isActive)
                          }
                        >
                          {emp.isActive ? "Resign" : "Reinstate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          aria-label={`Delete ${emp.name}`}
                          onClick={() => handleDelete(emp.id)}
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
