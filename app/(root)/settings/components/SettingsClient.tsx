"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Settings, Pencil, Check, X, Package as PackageIcon, MapPin } from "lucide-react";
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
  updatePackage,
  deletePackage,
} from "@/lib/actions/package.actions";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/lib/actions/location.actions";
import type { Category, Package as PackageType, Location as LocationType } from "@/types";

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
    try {
      const data = await getCategories(type);
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    }
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add category");
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update category");
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
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [name, setName] = useState("");
  const [monthlyFee, setMonthlyFee] = useState<number | string>("");
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState<number | string>("");
  const [editLoading, setEditLoading] = useState(false);

  const load = async () => {
    try {
      const data = await getPackages();
      setPackages(data);
    } catch {
      toast.error("Failed to load packages");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createPackage(name.trim(), Number(monthlyFee) || 0);
      setName("");
      setMonthlyFee("");
      toast.success("Package created successfully");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (pkg: PackageType) => {
    setEditingId(pkg._id);
    setEditName(pkg.name);
    setEditFee(pkg.monthlyFee);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditFee("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      await updatePackage(id, editName.trim(), Number(editFee) || 0);
      toast.success("Package updated successfully");
      setEditingId(null);
      setEditName("");
      setEditFee("");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update package");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string, pkgName: string) => {
    if (!confirm(`Are you sure you want to delete package "${pkgName}"?`)) return;
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
          placeholder="Package name (e.g., 20 Mbps Fiber)..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full sm:max-w-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-sm"
        />
        <Input
          type="number"
          min="0"
          placeholder="Monthly Fee ($)..."
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full sm:w-36 rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-sm font-semibold"
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !name.trim()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-sm text-sm font-semibold w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>

      {/* Package pill badges */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50/80 border border-indigo-200/80 rounded-xl px-3 py-2 shadow-2xs max-w-full hover:shadow-xs transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />

            {editingId === pkg._id ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 text-xs px-2 py-1 rounded-lg w-28 sm:w-36 bg-white border-slate-300"
                  placeholder="Name"
                  autoFocus
                />
                <Input
                  type="number"
                  min="0"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(pkg._id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-7 text-xs px-2 py-1 rounded-lg w-20 bg-white border-slate-300 font-bold"
                  placeholder="Fee"
                />
                <button
                  onClick={() => handleSaveEdit(pkg._id)}
                  disabled={editLoading || !editName.trim()}
                  className="p-1 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-100 transition-colors"
                  title="Save package"
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
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="text-xs font-bold text-indigo-950 truncate">
                    {pkg.name}
                  </span>
                  <span className="text-[11px] font-black text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded-md">
                    $ {pkg.monthlyFee}/mo
                  </span>
                </div>

                <div className="flex items-center gap-0.5 ml-1 border-l border-indigo-200/60 pl-1">
                  <button
                    onClick={() => handleStartEdit(pkg)}
                    className="text-indigo-400 hover:text-indigo-700 transition-colors p-0.5 shrink-0"
                    title="Edit package"
                    type="button"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id, pkg.name)}
                    className="text-indigo-400 hover:text-rose-600 transition-colors p-0.5 shrink-0"
                    title="Delete package"
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {packages.length === 0 && (
          <p className="text-xs text-slate-400 py-3">
            No internet packages defined yet. Add packages above to use them in customer profiles.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        Packages are selectable when adding or editing customers. Deleting a package in use by active customers is restricted.
      </p>
    </div>
  );
}

function LocationTab() {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const load = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch {
      toast.error("Failed to load locations");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createLocation(name.trim());
      setName("");
      toast.success("Location added successfully");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add location");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (loc: LocationType) => {
    setEditingId(loc._id);
    setEditName(loc.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      await updateLocation(id, editName.trim());
      toast.success("Location updated successfully");
      setEditingId(null);
      setEditName("");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update location");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string, locName: string) => {
    if (!confirm(`Are you sure you want to delete location "${locName}"?`)) return;
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
          placeholder="Service zone / area name (e.g., Sector 7, Uttara)..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full sm:max-w-sm rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !name.trim()}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-sm text-sm font-semibold w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>

      {/* Location pill badges */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {locations.map((loc) => (
          <div
            key={loc._id}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50/80 border border-emerald-200/80 rounded-xl px-3 py-1.5 shadow-2xs max-w-full hover:shadow-xs transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />

            {editingId === loc._id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(loc._id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-7 text-xs px-2 py-1 rounded-lg w-28 sm:w-36 bg-white border-slate-300"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(loc._id)}
                  disabled={editLoading || !editName.trim()}
                  className="p-1 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-100 transition-colors"
                  title="Save location"
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
                <span className="text-xs font-bold text-emerald-900 truncate">
                  {loc.name}
                </span>

                <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200/60 pl-1">
                  <button
                    onClick={() => handleStartEdit(loc)}
                    className="text-emerald-400 hover:text-emerald-700 transition-colors p-0.5 shrink-0"
                    title="Edit location"
                    type="button"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc._id, loc.name)}
                    className="text-emerald-400 hover:text-rose-600 transition-colors p-0.5 shrink-0"
                    title="Delete location"
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {locations.length === 0 && (
          <p className="text-xs text-slate-400 py-3">
            No service zones defined yet. Add areas above to group customers by coverage zone.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        Locations allow organizing customers and tracking connectivity by zone or neighborhood.
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
            Create or manage categories for income receipts and expense outflows.
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid grid-cols-2 sm:inline-flex sm:w-auto w-full bg-slate-100/90 p-1.5 rounded-2xl mb-5 gap-1.5 border border-slate-200/60">
              <TabsTrigger
                value="income"
                className="rounded-xl text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-center"
              >
                Income Categories
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                className="rounded-xl text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-center"
              >
                Expense Categories
              </TabsTrigger>
            </TabsList>
            <TabsContent value="income">
              <CategoryTab type="income" />
            </TabsContent>
            <TabsContent value="expense">
              <CategoryTab type="expense" />
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
            Define internet packages with default monthly fees. Used as dropdown options when adding customers.
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
            Define service areas / coverage zones. Selectable on customer records to organize accounts by zone.
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <LocationTab />
        </CardContent>
      </Card>
    </div>
  );
}
