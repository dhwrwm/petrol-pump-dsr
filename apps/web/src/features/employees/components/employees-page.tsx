import { useState } from "react";
import {
  FileText,
  HardHat,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
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
import {
  addEmployeeDocument,
  addSalaryRecord,
  createEmployee,
  deleteEmployee,
  deleteEmployeeDocument,
  updateEmployee,
} from "../api/employees.api";
import { useEmployees } from "../hooks/use-employees";
import type { Employee } from "../types/employees.types";

const DOC_LABELS: Record<string, string> = {
  AADHAR: "Aadhar",
  PAN: "PAN Card",
  DRIVING_LICENSE: "Driving Licence",
  OTHER: "Other",
};

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function EmployeeDetailPanel({
  employee,
  onClose,
  onRefetch,
}: {
  employee: Employee;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const [docType, setDocType] = useState("AADHAR");
  const [docUrl, setDocUrl] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [docError, setDocError] = useState("");
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const [salMonth, setSalMonth] = useState("");
  const [salPaid, setSalPaid] = useState("");
  const [salAdvance, setSalAdvance] = useState("");
  const [salDeductions, setSalDeductions] = useState("");
  const [salNote, setSalNote] = useState("");
  const [salError, setSalError] = useState("");
  const [isAddingSal, setIsAddingSal] = useState(false);

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docUrl.trim()) {
      setDocError("Document URL is required.");
      return;
    }
    setIsAddingDoc(true);
    setDocError("");
    try {
      await addEmployeeDocument(employee.id, {
        type: docType,
        url: docUrl.trim(),
        fileName: docFileName.trim() || undefined,
      });
      setDocUrl("");
      setDocFileName("");
      onRefetch();
    } catch (err: unknown) {
      setDocError(err instanceof Error ? err.message : "Failed to add document.");
    } finally {
      setIsAddingDoc(false);
    }
  }

  async function handleDeleteDoc(docId: string) {
    try {
      await deleteEmployeeDocument(employee.id, docId);
      onRefetch();
    } catch {
      onRefetch();
    }
  }

  async function handleAddSalary(e: React.FormEvent) {
    e.preventDefault();
    if (!salMonth || !salPaid) {
      setSalError("Month and paid amount are required.");
      return;
    }
    setIsAddingSal(true);
    setSalError("");
    try {
      await addSalaryRecord(employee.id, {
        month: salMonth + "-01",
        paid: Number(salPaid),
        advance: salAdvance ? Number(salAdvance) : 0,
        deductions: salDeductions ? Number(salDeductions) : 0,
        note: salNote.trim() || undefined,
      });
      setSalMonth("");
      setSalPaid("");
      setSalAdvance("");
      setSalDeductions("");
      setSalNote("");
      onRefetch();
    } catch (err: unknown) {
      setSalError(err instanceof Error ? err.message : "Failed to save salary record.");
    } finally {
      setIsAddingSal(false);
    }
  }

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-base font-bold">
          {employee.name} — {employee.designation}
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 grid gap-6">
        {/* Documents */}
        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">Documents</h3>
          {employee.documents.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File name</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{DOC_LABELS[doc.type] ?? doc.type}</TableCell>
                    <TableCell>{doc.fileName ?? "—"}</TableCell>
                    <TableCell>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-sm"
                      >
                        View
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDoc(doc.id)}
                        aria-label="Delete document"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <form onSubmit={handleAddDoc} className="flex gap-2 flex-wrap items-end">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="border rounded-md px-2 py-1.5 text-sm bg-background"
              >
                <option value="AADHAR">Aadhar</option>
                <option value="PAN">PAN Card</option>
                <option value="DRIVING_LICENSE">Driving Licence</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="grid gap-1.5 flex-1 min-w-[180px]">
              <label className="text-xs font-medium">URL *</label>
              <Input
                placeholder="Paste document link"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-medium">File name</label>
              <Input
                placeholder="e.g. aadhar_front.pdf"
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={isAddingDoc}>
              <Plus size={14} />
              {isAddingDoc ? "Adding..." : "Add"}
            </Button>
          </form>
          {docError && <p className="text-xs text-destructive">{docError}</p>}
        </section>

        {/* Salary Records */}
        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">
            Salary — Fixed: ₹{Number(employee.salary).toLocaleString("en-IN")}
          </h3>
          {employee.salaryRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Paid (₹)</TableHead>
                  <TableHead className="text-right">Advance (₹)</TableHead>
                  <TableHead className="text-right">Deductions (₹)</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.salaryRecords.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{formatMonth(rec.month)}</TableCell>
                    <TableCell className="text-right">
                      {Number(rec.paid).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(rec.advance).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(rec.deductions).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>{rec.note ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <form onSubmit={handleAddSalary} className="flex gap-2 flex-wrap items-end">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Month *</label>
              <Input
                type="month"
                value={salMonth}
                onChange={(e) => setSalMonth(e.target.value)}
                className="w-36"
              />
            </div>
            <div className="grid gap-1.5 w-28">
              <label className="text-xs font-medium">Paid (₹) *</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={salPaid}
                onChange={(e) => setSalPaid(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 w-28">
              <label className="text-xs font-medium">Advance (₹)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={salAdvance}
                onChange={(e) => setSalAdvance(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 w-28">
              <label className="text-xs font-medium">Deductions (₹)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={salDeductions}
                onChange={(e) => setSalDeductions(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-medium">Note</label>
              <Input
                placeholder="e.g. shortage deduction"
                value={salNote}
                onChange={(e) => setSalNote(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={isAddingSal}>
              <Plus size={14} />
              {isAddingSal ? "Saving..." : "Save"}
            </Button>
          </form>
          {salError && <p className="text-xs text-destructive">{salError}</p>}
        </section>
      </CardContent>
    </Card>
  );
}

export function EmployeesPage() {
  const { employees, isPending, error, refetch } = useEmployees();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [salary, setSalary] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = employees.filter((e) => e.isActive).length;
  const selected = employees.find((e) => e.id === selectedId) ?? null;

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
      setFormError(err instanceof Error ? err.message : "Failed to add employee.");
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
      if (selectedId === id) setSelectedId(null);
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
                  <label htmlFor="emp-designation" className="text-sm font-medium">
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
                  <TableHead>Resigned</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    data-state={selectedId === emp.id ? "selected" : undefined}
                  >
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>{emp.phone ?? "—"}</TableCell>
                    <TableCell>{formatDate(emp.joinedAt)}</TableCell>
                    <TableCell>
                      {emp.resignedAt ? formatDate(emp.resignedAt) : "—"}
                    </TableCell>
                    <TableCell>₹{Number(emp.salary).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant={emp.isActive ? "default" : "secondary"}>
                        {emp.isActive ? "Active" : "Resigned"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() =>
                            setSelectedId(
                              selectedId === emp.id ? null : emp.id,
                            )
                          }
                        >
                          <FileText size={14} />
                          {selectedId === emp.id ? "Close" : "Manage"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleToggleActive(emp.id, emp.isActive)}
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

      {selected && (
        <EmployeeDetailPanel
          employee={selected}
          onClose={() => setSelectedId(null)}
          onRefetch={refetch}
        />
      )}
    </>
  );
}
