"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Lock, Plus, Settings } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "@/lib/actions/category.actions";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
}

function CategoryTab({ type }: { type: "income" | "expense" }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

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
      await createCategory(newName.trim(), type);
      setNewName("");
      toast.success("Category added");
      load();
    } catch {
      toast.error("Category already exists");
    } finally {
      setLoading(false);
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
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={`New ${type} category name...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="max-w-sm rounded-xl border-slate-200 text-sm"
        />
        <Button
          onClick={handleAdd}
          disabled={loading || !newName.trim()}
          className="bg-[#3e0078] hover:bg-[#52029d] rounded-xl text-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Dynamic pill tags */}
      <div className="flex flex-wrap gap-2 pt-2">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-2xs"
          >
            <span className="text-xs font-semibold text-slate-700">
              {cat.name}
            </span>
            {cat.isDefault ? (
              <span title="Default category — cannot be deleted">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </span>
            ) : (
              <button
                onClick={() => handleDelete(cat._id, cat.name)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-xs text-slate-400 py-4">
            No categories created yet.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
        <Lock className="w-3 h-3 text-slate-400" /> Default system categories
        are protected and cannot be removed
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

      <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            Category Management
            <Badge
              variant="secondary"
              className="text-[10px] bg-purple-50 text-purple-700 border-purple-100 font-semibold"
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
            <TabsList className="bg-slate-100 p-1 rounded-xl mb-4 flex flex-wrap h-auto gap-1">
              <TabsTrigger
                value="expense"
                className="rounded-lg text-xs font-semibold"
              >
                Expense Categories
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="rounded-lg text-xs font-semibold"
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
    </div>
  );
}
