"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CustomerForm from "./CustomerForm";
import {
  getCustomers,
  deleteCustomer,
  bulkCreateCustomers,
} from "@/lib/actions/customer.actions";
import type { Customer } from "@/types";
import ExcelImportExport, {
  type ImportResult,
} from "@/components/shared/ExcelImportExport";
import { downloadTemplate, exportToExcel } from "@/lib/excel";

export default function CustomersClient({
  initialCustomers,
  initialTotal = 0,
  initialTotalPages = 1,
}: {
  initialCustomers: Customer[];
  initialTotal?: number;
  initialTotalPages?: number;
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    const res = await getCustomers({
      search,
      status,
      page,
      limit,
    });
    setCustomers(res.customers);
    setTotal(res.total);
    setTotalPages(res.totalPages || 1);
  }, [search, status, page, limit]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val === "all" ? "" : val);
    setPage(1);
  };

  const handleLimitChange = (val: string) => {
    setLimit(parseInt(val));
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        toast.success("Customer deleted successfully");
        loadCustomers();
      } catch {
        toast.error("Failed to delete customer");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
            Active
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
            Inactive
          </Badge>
        );
      case "Disconnected":
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200">
            Disconnected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // ── Excel Columns & Actions ─────────────────────────────────────────────
  const CUSTOMER_HEADERS = [
    "Name",
    "Phone",
    "Location",
    "Package",
    "Monthly Fee (৳)",
    "Connection Date (YYYY-MM-DD)",
    "Status",
    "Email",
    "Router",
    "IP Address",
    "Notes",
  ];

  const CUSTOMER_SAMPLE = {
    Name: "John Doe",
    Phone: "01700000000",
    Location: "Gulshan",
    Package: "Standard 10Mbps",
    "Monthly Fee (৳)": 1000,
    "Connection Date (YYYY-MM-DD)": new Date().toISOString().split("T")[0],
    Status: "Active",
    Email: "john@example.com",
    Router: "TP-Link Archer C6",
    "IP Address": "192.168.1.100",
    Notes: "VIP customer",
  };

  const handleTemplate = () => {
    downloadTemplate(
      CUSTOMER_HEADERS,
      CUSTOMER_SAMPLE,
      "customer_import_template.xlsx"
    );
  };

  const handleExport = async () => {
    try {
      const res = await getCustomers({
        search,
        status,
        limit: 10000,
      });
      const rows = res.customers.map((cust: Customer) => ({
        Name: cust.name,
        Phone: cust.phone,
        Location: cust.location,
        Package: cust.packageName,
        "Monthly Fee (৳)": cust.monthlyFee,
        "Connection Date (YYYY-MM-DD)": new Date(cust.connectionDate)
          .toISOString()
          .split("T")[0],
        Status: cust.status,
        Email: cust.email ?? "",
        Router: cust.router ?? "",
        "IP Address": cust.ipAddress ?? "",
        Notes: cust.notes ?? "",
      }));
      exportToExcel(
        rows,
        CUSTOMER_HEADERS,
        "Customers",
        "customer_export.xlsx"
      );
    } catch {
      toast.error("Failed to export customer data");
    }
  };

  const handleImport = async (
    rows: Record<string, unknown>[]
  ): Promise<ImportResult> => {
    const result = await bulkCreateCustomers(rows);
    loadCustomers();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-[#3e0078]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Customer Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Subscribers:{" "}
              <span className="font-bold text-slate-800">{total}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            label="Customers"
            onTemplate={handleTemplate}
            onExport={handleExport}
            onImport={handleImport}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3e0078] hover:bg-[#52029d] text-white shadow-md shadow-purple-900/10 rounded-xl w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800">
                  Add New Customer
                </DialogTitle>
              </DialogHeader>
              <CustomerForm
                onSuccess={() => {
                  setIsAddOpen(false);
                  loadCustomers();
                  toast.success("Customer added successfully");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Row Limits */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by code, name, phone..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-sm"
            />
          </div>
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[75px] rounded-xl border-slate-200 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Responsive Overflow Table */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Code
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Customer Name
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Phone
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Location
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Package
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Monthly Fee
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-slate-400 py-10 text-sm"
                  >
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer._id}
                    className="hover:bg-slate-50/60 border-slate-100 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-bold text-purple-900 whitespace-nowrap">
                      {customer.customerCode}
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-slate-800 whitespace-nowrap">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono whitespace-nowrap">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {customer.location ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                          {customer.location}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {customer.packageName}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-slate-800 whitespace-nowrap">
                      ৳{customer.monthlyFee.toFixed(2)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(customer.status)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Dialog
                          open={
                            isEditOpen && editingCustomer?._id === customer._id
                          }
                          onOpenChange={(open) => {
                            setIsEditOpen(open);
                            if (!open) setEditingCustomer(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                              onClick={() => setEditingCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold text-slate-800">
                                Edit Customer
                              </DialogTitle>
                            </DialogHeader>
                            <CustomerForm
                              customer={editingCustomer ?? undefined}
                              onSuccess={() => {
                                setIsEditOpen(false);
                                setEditingCustomer(null);
                                loadCustomers();
                                toast.success("Customer updated successfully");
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(customer._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 gap-3 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-700">
              {customers.length > 0 ? (page - 1) * limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-700">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-bold text-slate-700">{total}</span>{" "}
            subscribers
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-slate-200 text-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 font-medium">
              Page <span className="font-bold text-slate-800">{page}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-slate-200 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
