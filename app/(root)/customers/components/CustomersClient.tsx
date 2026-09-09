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
  Search,
  Users,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Wifi,
  MapPin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkCreateCustomers,
} from "@/lib/actions/customer.actions";
import { getPackages } from "@/lib/actions/package.actions";
import { getLocations } from "@/lib/actions/location.actions";
import CustomerForm, { type CustomerFormValues } from "./CustomerForm";
import type { Customer, Package as PackageType, Location as LocationType } from "@/types";
import ExcelImportExport, { type ImportResult } from "@/components/shared/ExcelImportExport";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

interface CustomersClientProps {
  initialCustomers: Customer[];
  initialTotal: number;
  initialTotalPages: number;
  initialPackages: PackageType[];
  initialLocations: LocationType[];
}

export default function CustomersClient({
  initialCustomers,
  initialTotal = 0,
  initialTotalPages = 1,
  initialPackages,
  initialLocations,
}: CustomersClientProps) {
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [packages, setPackages] = useState<PackageType[]>(initialPackages);
  const [locations, setLocations] = useState<LocationType[]>(initialLocations);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await getCustomers({
        search,
        status: status && status !== "all" ? status : undefined,
        packageName: selectedPackage && selectedPackage !== "all" ? selectedPackage : undefined,
        location: selectedLocation && selectedLocation !== "all" ? selectedLocation : undefined,
        page,
        limit,
      });
      setCustomers(res.customers);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load customers");
    }
  }, [search, status, selectedPackage, selectedLocation, page, limit]);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [loadData, mounted]);

  const loadOptions = async () => {
    try {
      const [pkgs, locs] = await Promise.all([getPackages(), getLocations()]);
      setPackages(pkgs);
      setLocations(locs);
    } catch {
      // ignore
    }
  };

  const handleCreate = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      await createCustomer(data);
      toast.success("Customer created successfully");
      setIsAddOpen(false);
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: CustomerFormValues, targetCustomerId?: string) => {
    const idToUpdate = targetCustomerId || editingCustomer?._id;
    if (!idToUpdate) {
      toast.error("No customer selected for update");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await updateCustomer(idToUpdate, {
        ...data,
        connectionDate: new Date(data.connectionDate),
      });
      toast.success("Customer updated successfully");
      setIsEditOpen(false);
      setEditingCustomer(null);
      // Immediately reflect update in table
      setCustomers((prev) =>
        prev.map((c) => (c._id === idToUpdate ? { ...c, ...updated } : c))
      );
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      toast.success("Customer removed");
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Cannot delete customer");
    }
  };

  // -------------------------------------------------------------------------
  // Excel Import / Export
  // -------------------------------------------------------------------------

  const handleExport = () => {
    if (customers.length === 0) {
      toast.error("No customer records to export");
      return;
    }

    const headers = [
      "Customer Code",
      "Name",
      "Phone",
      "Email",
      "Username",
      "Location",
      "Package",
      "Monthly Fee",
      "Connection Date",
      "Status",
      "Router",
      "IP Address",
      "Notes",
    ];

    const exportRows = customers.map((c) => ({
      "Customer Code": c.customerCode,
      Name: c.name,
      Phone: c.phone,
      Email: c.email || "",
      Username: c.username || "",
      Location: c.location,
      Package: c.packageName,
      "Monthly Fee": c.monthlyFee,
      "Connection Date": formatDate(c.connectionDate),
      Status: c.status,
      Router: c.router || "",
      "IP Address": c.ipAddress || "",
      Notes: c.notes || "",
    }));

    exportToExcel(
      exportRows,
      headers,
      "Customers",
      `ISP_Customers_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Customers exported successfully");
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Username",
      "Location",
      "Package Name",
      "Monthly Fee",
      "Connection Date",
      "Status",
      "Router",
      "IP Address",
      "Notes",
    ];

    const sampleRow = {
      "Customer Name": "Mohammad Ali",
      Phone: "01711000000",
      Email: "ali@example.com",
      Username: "ali_sbn",
      Location: locations[0]?.name || "Sector 7",
      "Package Name": packages[0]?.name || "20 Mbps Fiber",
      "Monthly Fee": packages[0]?.monthlyFee || 800,
      "Connection Date": "2026-01-15",
      Status: "Active",
      Router: "TP-Link WR840N",
      "IP Address": "192.168.10.25",
      Notes: "Flat 4B, Green House",
    };

    downloadTemplate(headers, sampleRow, "Customer_Import_Template.xlsx");
  };

  const handleImport = async (rows: Record<string, unknown>[]): Promise<ImportResult> => {
    const result = await bulkCreateCustomers(rows);
    loadData();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-[#3e0078]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Customer Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage client broadband accounts, connection plans, and service zones
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Import / Export Toolbar */}
          <ExcelImportExport
            onImport={handleImport}
            onExport={handleExport}
            onTemplate={handleDownloadTemplate}
            label="Customer"
          />

          {/* Add Customer Button */}
          <Dialog
            open={isAddOpen}
            onOpenChange={(open) => {
              setIsAddOpen(open);
              if (open) loadOptions();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#3e0078] to-[#5b0ea6] hover:from-[#4d0194] hover:to-[#6d13c7] text-white rounded-xl shadow-md font-bold text-xs h-9">
                <Plus className="mr-1.5 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#3e0078]" />
                  Add New Customer
                </DialogTitle>
              </DialogHeader>
              <CustomerForm
                packages={packages}
                locations={locations}
                onSubmit={handleCreate}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, code, phone, username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 rounded-xl border-slate-200 text-xs h-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val === "all" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active Only</SelectItem>
              <SelectItem value="Inactive">Inactive Only</SelectItem>
              <SelectItem value="Disconnected">Disconnected Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Package Filter */}
          <Select
            value={selectedPackage}
            onValueChange={(val) => {
              setSelectedPackage(val === "all" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Packages</SelectItem>
              {packages.map((pkg) => (
                <SelectItem key={pkg._id} value={pkg.name}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select
            value={selectedLocation}
            onValueChange={(val) => {
              setSelectedLocation(val === "all" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Service Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Zones</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc._id} value={loc.name}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Customer Records Table */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Code</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Customer Details</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Package & Plan</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Location / Zone</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Monthly Fee</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Connection Date</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-slate-400 text-xs">
                    No customer accounts found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-mono text-xs font-extrabold text-[#3e0078]">
                      {c.customerCode}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {c.email}
                            </span>
                          )}
                          {c.username && (
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                              @{c.username}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700">
                          {c.packageName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-700">
                          {c.location}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-extrabold text-slate-900">
                        $ {c.monthlyFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {formatDate(c.connectionDate)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          c.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                            : c.status === "Inactive"
                            ? "bg-amber-100 text-amber-800 border-amber-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                            : "bg-rose-100 text-rose-800 border-rose-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCustomer(c);
                            setIsEditOpen(true);
                            loadOptions();
                          }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-[#3e0078] hover:bg-purple-50 rounded-lg"
                          title="Edit Customer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(c._id, c.name)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50/40 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(parseInt(val, 10));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 rounded-lg text-xs bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>of {total} total customers</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 w-7 p-0 rounded-lg border-slate-200 bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 w-7 p-0 rounded-lg border-slate-200 bg-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingCustomer(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#3e0078]" />
              Edit Customer - {editingCustomer?.customerCode}
              {editingCustomer?.name ? ` (${editingCustomer.name})` : ""}
            </DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm
              key={editingCustomer._id}
              customer={editingCustomer}
              packages={packages}
              locations={locations}
              onSubmit={(data) => handleUpdate(data, editingCustomer._id)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
