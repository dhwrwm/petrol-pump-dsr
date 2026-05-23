import { useState } from "react";
import { ArrowLeft, HardHat, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
  deleteEmployeeDocument,
} from "../api/employees.api";
import { useEmployee } from "../hooks/use-employee";

const DOC_LABELS: Record<string, string> = {
  AADHAR: "Aadhar",
  PAN: "PAN Card",
  DRIVING_LICENSE: "Driving Licence",
  OTHER: "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employee, isPending, error, refetch } = useEmployee(id!);

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
      await addEmployeeDocument(id!, {
        type: docType,
        url: docUrl.trim(),
        fileName: docFileName.trim() || undefined,
      });
      setDocUrl("");
      setDocFileName("");
      refetch();
    } catch (err: unknown) {
      setDocError(
        err instanceof Error ? err.message : "Failed to add document.",
      );
    } finally {
      setIsAddingDoc(false);
    }
  }

  async function handleDeleteDoc(docId: string) {
    try {
      await deleteEmployeeDocument(id!, docId);
      refetch();
    } catch {
      refetch();
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
      await addSalaryRecord(id!, {
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
      refetch();
    } catch (err: unknown) {
      setSalError(
        err instanceof Error ? err.message : "Failed to save salary record.",
      );
    } finally {
      setIsAddingSal(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error || !employee) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Employee not found."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <header className="flex items-start gap-4 max-md:flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/employees")}
          aria-label="Back to employees"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground tracking-wide">
            Employees
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <Badge variant={employee.isActive ? "default" : "secondary"}>
              {employee.isActive ? "Active" : "Resigned"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{employee.designation}</p>
        </div>
      </header>

      {/* Info card */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HardHat size={16} />
            Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <dl className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-4">
            {[
              { label: "Phone", value: employee.phone ?? "—" },
              {
                label: "Monthly Salary",
                value: `₹${Number(employee.salary).toLocaleString("en-IN")}`,
              },
              { label: "Date of Joining", value: formatDate(employee.joinedAt) },
              {
                label: "Date of Resignation",
                value: employee.resignedAt
                  ? formatDate(employee.resignedAt)
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground mb-0.5">
                  {label}
                </dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-base font-semibold">Documents</CardTitle>
        </CardHeader>
        <CardContent className="px-4 grid gap-4">
          {employee.documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File name</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{DOC_LABELS[doc.type] ?? doc.type}</TableCell>
                    <TableCell>{doc.fileName ?? "—"}</TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
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
          ) : (
            <p className="text-sm text-muted-foreground">No documents added.</p>
          )}

          <form
            onSubmit={handleAddDoc}
            className="flex gap-2 flex-wrap items-end border-t pt-4"
          >
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
            <div className="grid gap-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-medium">Document URL *</label>
              <Input
                placeholder="Paste link to uploaded document"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-medium">File name</label>
              <Input
                placeholder="e.g. aadhar_front.pdf"
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={isAddingDoc}>
              <Plus size={14} />
              {isAddingDoc ? "Adding..." : "Add Document"}
            </Button>
          </form>
          {docError && <p className="text-xs text-destructive">{docError}</p>}
        </CardContent>
      </Card>

      {/* Salary Records */}
      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-base font-semibold">
            Salary Records
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Fixed: ₹{Number(employee.salary).toLocaleString("en-IN")}/month
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 grid gap-4">
          {employee.salaryRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Paid (₹)</TableHead>
                  <TableHead className="text-right">Advance (₹)</TableHead>
                  <TableHead className="text-right">Deductions (₹)</TableHead>
                  <TableHead className="text-right">Net (₹)</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.salaryRecords.map((rec) => {
                  const net =
                    Number(rec.paid) -
                    Number(rec.advance) -
                    Number(rec.deductions);
                  return (
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
                      <TableCell className="text-right font-medium">
                        {net.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>{rec.note ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No salary records yet.
            </p>
          )}

          <form
            onSubmit={handleAddSalary}
            className="flex gap-2 flex-wrap items-end border-t pt-4"
          >
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
            <div className="grid gap-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-medium">Note</label>
              <Input
                placeholder="e.g. shortage deduction"
                value={salNote}
                onChange={(e) => setSalNote(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={isAddingSal}>
              <Plus size={14} />
              {isAddingSal ? "Saving..." : "Save Record"}
            </Button>
          </form>
          {salError && <p className="text-xs text-destructive">{salError}</p>}
        </CardContent>
      </Card>
    </>
  );
}
