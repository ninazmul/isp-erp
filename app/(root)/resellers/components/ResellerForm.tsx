"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Reseller } from "@/types";

interface ResellerFormProps {
  reseller?: Reseller | null;
  onSubmit: (data: ResellerFormValues) => Promise<void>;
  isLoading?: boolean;
}

export type ResellerFormValues = {
  name: string;
  phone: string;
  email?: string;
  location: string;
  packageDesc?: string;
  monthlyFee: number;
  activeClients: number;
  inactiveClients: number;
  connectionDate: string;
  status: "Active" | "Inactive";
  notes?: string;
};

export default function ResellerForm({
  reseller,
  onSubmit,
  isLoading = false,
}: ResellerFormProps) {
  const defaultConnectionDate = reseller?.connectionDate
    ? new Date(reseller.connectionDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const form = useForm<ResellerFormValues>({
    defaultValues: {
      name: reseller?.name || "",
      phone: reseller?.phone || "",
      email: reseller?.email || "",
      location: reseller?.location || "",
      packageDesc: reseller?.packageDesc || "",
      monthlyFee: reseller?.monthlyFee ?? 0,
      activeClients: reseller?.activeClients ?? 0,
      inactiveClients: reseller?.inactiveClients ?? 0,
      connectionDate: defaultConnectionDate,
      status: (reseller?.status as "Active" | "Inactive") || "Active",
      notes: reseller?.notes || "",
    },
  });

  useEffect(() => {
    if (reseller) {
      form.reset({
        name: reseller.name,
        phone: reseller.phone,
        email: reseller.email || "",
        location: reseller.location,
        packageDesc: reseller.packageDesc || "",
        monthlyFee: reseller.monthlyFee,
        activeClients: reseller.activeClients,
        inactiveClients: reseller.inactiveClients,
        connectionDate: new Date(reseller.connectionDate).toISOString().split("T")[0],
        status: (reseller.status as "Active" | "Inactive") || "Active",
        notes: reseller.notes || "",
      });
    }
  }, [reseller, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[68vh] overflow-y-auto space-y-4 pr-2 pb-2">

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Reseller name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Reseller Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Dhaka Fiber Networks"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 01712345678"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="reseller@example.com"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location — plain text input, not dropdown */}
            <FormField
              control={form.control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Location / Service Area *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mirpur, Dhaka"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Package Description & Monthly Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="packageDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Package / Bandwidth Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Dedicated 200 Mbps Fiber"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyFee"
              rules={{
                required: "Monthly fee is required",
                min: { value: 0, message: "Fee cannot be negative" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Monthly Fee ($) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      className="rounded-xl border-slate-200 font-bold"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Active / Inactive Clients */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Client Count (under this reseller)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activeClients"
                rules={{ min: { value: 0, message: "Cannot be negative" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-emerald-700">
                      Active Clients
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="rounded-xl border-emerald-200 bg-emerald-50/60 font-bold text-emerald-800 focus-visible:ring-emerald-500"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inactiveClients"
                rules={{ min: { value: 0, message: "Cannot be negative" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-500">
                      Inactive Clients
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="rounded-xl border-slate-200 font-bold text-slate-700"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Connection Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="connectionDate"
              rules={{ required: "Connection date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Contract / Connection Date *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Reseller Status
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700">
                  Notes / Remarks (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Contract terms, contact person, additional details..."
                    className="rounded-xl border-slate-200 resize-none"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white rounded-xl shadow-md font-bold text-sm"
          >
            {reseller ? "Save Changes" : "Create Reseller"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
