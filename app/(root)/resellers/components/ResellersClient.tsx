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
  Network,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Wifi,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getResellers,
  createReseller,
  updateReseller,
  deleteReseller,
  bulkCreateResellers,
} from "@/lib/actions/reseller.actions";
import ResellerForm, { type ResellerFormValues } from "./ResellerForm";
import type { Reseller } from "@/types";
import ExcelImportExport, { type ImportResult } from "@/components/shared/ExcelImportExport";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

interface ResellersClientProps {
  initialResellers: Reseller[];
  initialTotal: number;
  initialTotalPages: number;
}

export default function ResellersClient({
  initialResellers,
  initialTotal = 0,
  initialTotalPages = 1,
}: ResellersClientProps) {
  const [mounted, setMounted] = useState(false);
  const [resellers, setResellers] = useState<Reseller[]>(initialResellers);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await getResellers({
        search,
        status: status && status !== "all" ? status : undefined,
        page,
        limit,
      });
      setResellers(res.resellers);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load resellers");
    }
  }, [search, status, page, limit]);

  useEffect(() => {
    if (mounted) loadData();
  }, [loadData, mounted]);

  const handleCreate = async (data: ResellerFormValues) => {
    setIsSubmitting(true);
    try {
      await createReseller(data);
      toast.success("Reseller created successfully");
      setIsAddOpen(false);
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create reseller");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: ResellerFormValues) => {
    if (!editingReseller) return;
    setIsSubmitting(true);
    try {
      await updateReseller(editingReseller._id, {
        ...data,
        connectionDate: new Date(data.connectionDate),
      });
      toast.success("Reseller updated successfully");
      setIsEditOpen(false);
      setEditingReseller(null);
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update reseller");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete reseller "${name}"?`)) return;
    try {
      await deleteReseller(id);
      toast.success("Reseller removed");
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Cannot delete reseller");
    }
  };

  // -------------------------------------------------------------------------
  // Excel
  // -------------------------------------------------------------------------

  const handleExport = () => {
    if (resellers.length === 0) {
      toast.error("No reseller records to export");
      return;
    }
    const headers = [
      "Reseller Code","Name","Phone","Email","Location",
      "Package / Bandwidth","Monthly Fee","Active Clients",
      "Inactive Clients","Connection Date","Status","Notes",
    ];
    const exportRows = resellers.map((r) => ({
      "Reseller Code": r.resellerCode,
      Name: r.name,
      Phone: r.phone,
      Email: r.email || "",
      Location: r.location,
      "Package / Bandwidth": r.packageDesc || "",
      "Monthly Fee": r.monthlyFee,
      "Active Clients": r.activeClients,
      "Inactive Clients": r.inactiveClients,
      "Connection Date": formatDate(r.connectionDate),
      Status: r.status,
      Notes: r.notes || "",
    }));
    exportToExcel(
      exportRows,
      headers,
      "Resellers",
      `ISP_Resellers_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Resellers exported");
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Name","Phone","Email","Location",
      "Package / Bandwidth","Monthly Fee ($)",
      "Active Clients","Inactive Clients",
      "Connection Date (YYYY-MM-DD)","Status","Notes",
    ];
    const sampleRow = {
      Name: "Dhaka Fiber Networks",
      Phone: "01811000000",
      Email: "dhaka@fibernet.bd",
      Location: "Mirpur, Dhaka",
      "Package / Bandwidth": "Dedicated 200 Mbps",
      "Monthly Fee ($)": 15000,
      "Active Clients": 45,
      "Inactive Clients": 5,
      "Connection Date (YYYY-MM-DD)": "2025-01-15",
      Status: "Active",
      Notes: "Contract renewed annually",
    };
    downloadTemplate(headers, sampleRow, "Reseller_Import_Template.xlsx");
  };

  const handleImport = async (rows: Record<string, unknown>[]): Promise<ImportResult> => {
    const result = await bulkCreateResellers(rows);
    loadData();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-50 text-violet-700">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Reseller Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage sub-distributors, downstream operators, and reseller accounts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onImport={handleImport}
            onExport={handleExport}
            onTemplate={handleDownloadTemplate}
            label="Reseller"
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white rounded-xl shadow-md font-bold text-xs h-9">
                <Plus className="mr-1.5 h-4 w-4" /> Add Reseller
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Network className="w-5 h-5 text-violet-700" />
                  Add New Reseller
                </DialogTitle>
              </DialogHeader>
              <ResellerForm onSubmit={handleCreate} isLoading={isSubmitting} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, code, phone, location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 rounded-xl border-slate-200 text-xs h-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(val) => { setStatus(val === "all" ? "" : val); setPage(1); }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active Only</SelectItem>
              <SelectItem value="Inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Code</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Reseller Details</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Location</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Package / BW</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Monthly Fee</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Clients</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Since</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-36 text-center text-slate-400 text-xs">
                    No reseller accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                resellers.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-mono text-xs font-extrabold text-violet-700">
                      {r.resellerCode}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{r.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {r.phone}
                          </span>
                          {r.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {r.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-700">
                          {r.location}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {r.packageDesc ? (
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600">{r.packageDesc}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-extrabold text-slate-900">
                        $ {r.monthlyFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-500" />
                          <span className="font-bold text-emerald-700">{r.activeClients}</span>
                        </div>
                        <span className="text-slate-300">/</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-500">{r.inactiveClients}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {formatDate(r.connectionDate)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          r.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                            : "bg-amber-100 text-amber-800 border-amber-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingReseller(r); setIsEditOpen(true); }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg"
                          title="Edit Reseller"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r._id, r.name)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Reseller"
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50/40 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => { setLimit(parseInt(val, 10)); setPage(1); }}
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
            <span>of {total} resellers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm" variant="outline"
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
              size="sm" variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 w-7 p-0 rounded-lg border-slate-200 bg-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditingReseller(null); }}
      >
        <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-violet-700" />
              Edit Reseller — {editingReseller?.resellerCode}
            </DialogTitle>
          </DialogHeader>
          {editingReseller && (
            <ResellerForm
              reseller={editingReseller}
              onSubmit={handleUpdate}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
