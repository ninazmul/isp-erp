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
import type { Customer, Package as PackageType, Location as LocationType } from "@/types";

interface CustomerFormProps {
  customer?: Customer | null;
  packages: PackageType[];
  locations: LocationType[];
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isLoading?: boolean;
}

export type CustomerFormValues = {
  name: string;
  phone: string;
  email?: string;
  username?: string;
  location: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: string;
  router?: string;
  ipAddress?: string;
  status: "Active" | "Inactive" | "Disconnected";
  notes?: string;
};

export default function CustomerForm({
  customer,
  packages,
  locations,
  onSubmit,
  isLoading = false,
}: CustomerFormProps) {
  const defaultConnectionDate = customer?.connectionDate
    ? new Date(customer.connectionDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      username: customer?.username || "",
      location: customer?.location || (locations[0]?.name ?? ""),
      packageName: customer?.packageName || (packages[0]?.name ?? ""),
      monthlyFee: customer?.monthlyFee ?? (packages[0]?.monthlyFee ?? 0),
      connectionDate: defaultConnectionDate,
      router: customer?.router || "",
      ipAddress: customer?.ipAddress || "",
      status: (customer?.status as "Active" | "Inactive" | "Disconnected") || "Active",
      notes: customer?.notes || "",
    },
  });

  // When selected package changes in add mode, automatically update monthly fee if not custom edited
  const handlePackageChange = (selectedPkgName: string) => {
    form.setValue("packageName", selectedPkgName);
    const matchedPkg = packages.find((p) => p.name === selectedPkgName);
    if (matchedPkg && !customer) {
      form.setValue("monthlyFee", matchedPkg.monthlyFee);
    }
  };

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        username: customer.username || "",
        location: customer.location,
        packageName: customer.packageName,
        monthlyFee: customer.monthlyFee,
        connectionDate: new Date(customer.connectionDate).toISOString().split("T")[0],
        router: customer.router || "",
        ipAddress: customer.ipAddress || "",
        status: (customer.status as "Active" | "Inactive" | "Disconnected") || "Active",
        notes: customer.notes || "",
      });
    }
  }, [customer, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[68vh] overflow-y-auto space-y-4 pr-2 pb-2">
          {/* Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Customer name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Full Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Doe"
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
                      placeholder="client@example.com"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    PPPoE / Login Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. john_sbn"
                      className="rounded-xl border-slate-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Package & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="packageName"
              rules={{ required: "Package is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Internet Package *
                  </FormLabel>
                  <Select
                    onValueChange={handlePackageChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg._id} value={pkg.name}>
                          {pkg.name} (৳{pkg.monthlyFee}/mo)
                        </SelectItem>
                      ))}
                      {packages.length === 0 && (
                        <SelectItem value="Standard">Standard Package</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Service Location / Area *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc._id} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                      {locations.length === 0 && (
                        <SelectItem value="Main Zone">Main Zone</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Monthly Fee & Connection Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Monthly Fee (৳) *
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

            <FormField
              control={form.control}
              name="connectionDate"
              rules={{ required: "Connection date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Connection Date *
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
          </div>

          {/* Status & Router / IP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Account Status
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
                      <SelectItem value="Disconnected">Disconnected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="router"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    Router Model
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. TP-Link Archer C6"
                      className="rounded-xl border-slate-200 text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">
                    IP Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 192.168.1.100"
                      className="rounded-xl border-slate-200 text-xs font-mono"
                      {...field}
                    />
                  </FormControl>
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
                  Remarks / Notes (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional customer details, building number, pole ID..."
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

        {/* Footer Submit */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 bg-gradient-to-r from-[#3e0078] to-[#5b0ea6] hover:from-[#4d0194] hover:to-[#6d13c7] text-white rounded-xl shadow-md font-bold text-sm"
          >
            {customer ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
