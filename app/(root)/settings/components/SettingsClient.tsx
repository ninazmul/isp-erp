"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Lock, Plus } from "lucide-react";
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

  const handleDelete = async (id: string) => {
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
      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder={`New ${type} category name...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="max-w-sm"
        />
        <Button onClick={handleAdd} disabled={loading || !newName.trim()}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      {/* Category list */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center gap-1.5 bg-gray-50 border rounded-full px-3 py-1.5"
          >
            <span className="text-sm font-medium">{cat.name}</span>
            {cat.isDefault ? (
              <span title="Default category — cannot be deleted"><Lock className="w-3.5 h-3.5 text-gray-400" /></span>
            ) : (
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-gray-400">No categories yet.</p>
        )}
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Lock className="w-3 h-3" /> Default categories cannot be deleted
      </p>
    </div>
  );
}

export default function SettingsClient() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Category Management
            <Badge variant="secondary" className="text-xs font-normal">
              Dynamic
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-500">
            Add or remove categories for income and expense entries. Default categories are protected.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense">
            <TabsList className="mb-4">
              <TabsTrigger value="expense">Expense Categories</TabsTrigger>
              <TabsTrigger value="income">Income Categories</TabsTrigger>
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
