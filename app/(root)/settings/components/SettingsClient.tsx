"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Settings, MapPin, Package as PackageIcon, Pencil, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category.actions";
import {
  getPackages,
  createPackage,
  deletePackage,
} from "@/lib/actions/package.actions";
import {
  getLocations,
  createLocation,
  deleteLocation,
} from "@/lib/actions/location.actions";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
}

interface Package {
  _id: string;
  name: string;
  monthlyFee: number;
}

interface Location {
  _id: string;
  name: string;
}

function CategoryTab({ type }: { type: "income" | "expense" }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  // Category Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const isExpense = type === "expense";

  const load = async () => {
    const data = await getCategories(type);
    setCategories(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const result = await createCategory(newName.trim(), type);
      if (!result.success) {
        toast.error(result.error ?? "Failed to add category");
        return;
      }
      setNewName("");
      toast.success("Category added");
      load();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const result = await updateCategory(id, editName.trim());
      if (!result.success) {
        toast.error(result.error ?? "Failed to update category");
        return;
      }
      toast.success("Category updated successfully");
      setEditingId(null);
      setEditName("");
      load();
    } catch {
      toast.error("Failed to update category");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Cannot delete category");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder={`New ${type} category name...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full sm:max-w-sm rounded-xl border-slate-200 focus-visible:ring-purple-500 text-sm"
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className={
            isExpense
              ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl shadow-sm text-sm font-semibold w-full sm:w-auto"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-sm text-sm font-semibold w-full sm:w-auto"
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add {isExpense ? "Expense" : "Income"} Category
        </Button>
      </div>

      {/* Dynamic pill tags with Edit and Delete options */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className={
              isExpense
                ? "flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50/80 border border-rose-200/80 rounded-xl px-3 py-1.5 shadow-2xs max-w-full hover:shadow-xs transition-all"
                : "flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50/80 border border-emerald-200/80 rounded-xl px-3 py-1.5 shadow-2xs max-w-full hover:shadow-xs transition-all"
            }
          >
            <span
              className={
                isExpense
                  ? "w-2 h-2 rounded-full bg-rose-500 shrink-0"
                  : "w-2 h-2 rounded-full bg-emerald-500 shrink-0"
              }
            />

            {editingId === cat._id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(cat._id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-7 text-xs px-2 py-1 rounded-lg w-28 sm:w-36 bg-white border-slate-300"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(cat._id)}
                  disabled={editLoading || !editName.trim()}
                  className="p-1 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-100 transition-colors"
                  title="Save category"
                  type="button"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                  title="Cancel edit"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span
                  className={
                    isExpense
                      ? "text-xs font-bold text-rose-900 truncate"
                      : "text-xs font-bold text-emerald-900 truncate"
                  }
                >
                  {cat.name}
                </span>

                <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200/60 pl-1">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className={
                      isExpense
                        ? "text-rose-400 hover:text-rose-700 transition-colors p-0.5 shrink-0"
                        : "text-emerald-400 hover:text-emerald-700 transition-colors p-0.5 shrink-0"
                    }
                    title="Edit category"
                    type="button"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className={
                      isExpense
                        ? "text-rose-400 hover:text-rose-700 transition-colors p-0.5 shrink-0"
                        : "text-emerald-400 hover:text-emerald-700 transition-colors p-0.5 shrink-0"
                    }
                    title="Delete category"
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-xs text-slate-400 py-3">
            No {type} categories created yet.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        Tip: Categories used by existing expense or income records cannot be
        removed until those records are reassigned.
      </p>
    </div>
  );
}

function PackageTab() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await getPackages();
    setPackages(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const fee = parseFloat(newFee);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid monthly fee");
      return;
    }
    setLoading(true);
    try {
      await createPackage(newName.trim(), fee);
      setNewName("");
      setNewFee("");
      toast.success("Package added");
      load();
    } catch {
      toast.error("Package already exists");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete package "${name}"?`)) return;
    try {
      await deletePackage(id);
      toast.success("Package deleted");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Cannot delete package");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder="Package name (e.g. 10 Mbps)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full sm:max-w-sm rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-sm"
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Monthly fee (৳)"
          value={newFee}
          onChange={(e) => setNewFee(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full sm:max-w-[180px] rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-sm"
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className="bg-gradient-to-r from-[#3e0078] to-[#6b11c9] hover:from-[#4c0094] hover:to-[#7c17ea] text-white rounded-xl shadow-sm text-sm font-semibold w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>

      {/* Dynamic pill tags */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50/80 border border-purple-200/80 rounded-xl px-3.5 py-1.5 shadow-2xs max-w-full hover:shadow-xs transition-all"
          >
            <PackageIcon className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span className="text-xs font-bold text-purple-950 truncate">
              {pkg.name}
            </span>
            <span className="text-[10px] font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
              ৳{pkg.monthlyFee}
            </span>
            <button
              onClick={() => handleDelete(pkg._id, pkg.name)}
              className="text-purple-400 hover:text-rose-600 transition-colors p-0.5 shrink-0 ml-0.5"
              title="Delete package"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {packages.length === 0 && (
          <p className="text-xs text-slate-400 py-3">
            No packages created yet.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        Tip: Packages still assigned to customers cannot be removed until
        reassigned.
      </p>
    </div>
  );
}

function LocationTab() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await getLocations();
    setLocations(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await createLocation(newName.trim());
      setNewName("");
      toast.success("Location added");
      load();
    } catch {
      toast.error("Location already exists");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete location "${name}"?`)) return;
    try {
      await deleteLocation(id);
      toast.success("Location deleted");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Cannot delete location");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder="New location name (e.g. Dhanmondi, Area-3)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full sm:max-w-sm rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-sm text-sm font-semibold w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>

      {/* Dynamic pill tags */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {locations.map((loc) => (
          <div
            key={loc._id}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-50 to-cyan-50/80 border border-sky-200/80 rounded-xl px-3.5 py-1.5 shadow-2xs max-w-full hover:shadow-xs transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="text-xs font-bold text-sky-950 truncate">
              {loc.name}
            </span>
            <button
              onClick={() => handleDelete(loc._id, loc.name)}
              className="text-sky-400 hover:text-rose-600 transition-colors p-0.5 shrink-0 ml-0.5"
              title="Delete location"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="text-xs text-slate-400 py-3">
            No locations created yet.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        Tip: Locations still assigned to customers cannot be removed until
        reassigned.
      </p>
    </div>
  );
}

export default function SettingsClient() {
  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-[#3e0078]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Application Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage system-wide classifications and configurations
            </p>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <Card className="rounded-2xl border border-slate-100 border-t-4 border-t-purple-600 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-base font-bold text-slate-800">
            <span>Category Management</span>
            <Badge
              variant="secondary"
              className="w-fit text-[10px] bg-purple-100 text-purple-800 border-purple-200 font-bold px-2.5 py-0.5 rounded-md"
            >
              Dynamic Taxonomies
            </Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Create or manage categories for income receipts and expense
            outflows.
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid grid-cols-2 sm:inline-flex sm:w-auto w-full bg-slate-100/90 p-1.5 rounded-2xl mb-5 gap-1.5 border border-slate-200/60">
              <TabsTrigger
                value="expense"
                className="rounded-xl text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-center"
              >
                Expense Categories
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="rounded-xl text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-center"
              >
                Income Categories
              </TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              <CategoryTab type="expense" />
            </TabsContent>
            <TabsContent value="income">
              <CategoryTab type="income" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Package Management */}
      <Card className="rounded-2xl border border-slate-100 border-t-4 border-t-indigo-600 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-base font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-[#3e0078]" />
              Package Management
            </span>
            <Badge
              variant="secondary"
              className="w-fit text-[10px] bg-indigo-100 text-indigo-800 border-indigo-200 font-bold px-2.5 py-0.5 rounded-md"
            >
              ISP Plans
            </Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Define internet packages with default monthly fees. Used as
            dropdown options when adding customers.
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <PackageTab />
        </CardContent>
      </Card>

      {/* Location Management */}
      <Card className="rounded-2xl border border-slate-100 border-t-4 border-t-emerald-600 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-base font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Location Management
            </span>
            <Badge
              variant="secondary"
              className="w-fit text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200 font-bold px-2.5 py-0.5 rounded-md"
            >
              Service Zones
            </Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Define service areas / coverage zones. Optional field selectable on
            the customer form.
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <LocationTab />
        </CardContent>
      </Card>
    </div>
  );
}
