"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createCustomer, updateCustomer } from "@/lib/actions/customer.actions";
import { getPackages, createPackage } from "@/lib/actions/package.actions";
import { getLocations, createLocation } from "@/lib/actions/location.actions";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: Date;
  router?: string;
  ipAddress?: string;
  status: string;
  notes?: string;
}

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: string;
  router: string;
  ipAddress: string;
  status: string;
  notes: string;
}

interface PackageOpt {
  _id: string;
  name: string;
  monthlyFee: number;
}

interface LocationOpt {
  _id: string;
  name: string;
}

export default function CustomerForm({
  customer,
  onSuccess,
}: CustomerFormProps) {
  const [packages, setPackages] = useState<PackageOpt[]>([]);
  const [locations, setLocations] = useState<LocationOpt[]>([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgFee, setNewPkgFee] = useState<string>("");
  const [addingPkg, setAddingPkg] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [addingLoc, setAddingLoc] = useState(false);

  const form = useForm<CustomerFormData>({
    defaultValues: customer
      ? {
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? "",
          location: customer.location ?? "",
          packageName: customer.packageName,
          monthlyFee: customer.monthlyFee,
          connectionDate: new Date(customer.connectionDate)
            .toISOString()
            .split("T")[0],
          router: customer.router ?? "",
          ipAddress: customer.ipAddress ?? "",
          status: customer.status,
          notes: customer.notes ?? "",
        }
      : {
          name: "",
          phone: "",
          email: "",
          location: "",
          packageName: "",
          monthlyFee: 0,
          connectionDate: new Date().toISOString().split("T")[0],
          router: "",
          ipAddress: "",
          status: "Active",
          notes: "",
        },
  });

  useEffect(() => {
    getPackages().then(setPackages);
    getLocations().then(setLocations);
  }, []);

  const handleAddPackage = async () => {
    if (!newPkgName.trim()) return;
    const fee = parseFloat(newPkgFee);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid monthly fee");
      return;
    }
    setAddingPkg(true);
    try {
      const created = await createPackage(newPkgName.trim(), fee);
      setPackages((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      form.setValue("packageName", created.name);
      if (!form.getValues("monthlyFee") || form.getValues("monthlyFee") === 0) {
        form.setValue("monthlyFee", created.monthlyFee);
      }
      setNewPkgName("");
      setNewPkgFee("");
      setShowAddPackage(false);
      toast.success("Package added");
    } catch {
      toast.error("Package already exists");
    } finally {
      setAddingPkg(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocName.trim()) return;
    setAddingLoc(true);
    try {
      const created = await createLocation(newLocName.trim());
      setLocations((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      form.setValue("location", created.name);
      setNewLocName("");
      setShowAddLocation(false);
      toast.success("Location added");
    } catch {
      toast.error("Location already exists");
    } finally {
      setAddingLoc(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const payload = {
        ...data,
        location: data.location,
        connectionDate: new Date(data.connectionDate),
        email: data.email || undefined,
        router: data.router || undefined,
        ipAddress: data.ipAddress || undefined,
        notes: data.notes || undefined,
      };
      if (customer) {
        await updateCustomer(customer._id, payload);
      } else {
        await createCustomer(payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const handlePackageChange = (value: string) => {
    form.setValue("packageName", value);
    const pkg = packages.find((p) => p.name === value);
    if (pkg && pkg.monthlyFee >= 0) {
      form.setValue("monthlyFee", pkg.monthlyFee);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            rules={{ required: "Phone is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Package dropdown */}
          <FormField
            control={form.control}
            name="packageName"
            rules={{ required: "Package is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package</FormLabel>
                <Select
                  onValueChange={handlePackageChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg._id} value={pkg.name}>
                        {pkg.name} (৳{pkg.monthlyFee})
                      </SelectItem>
                    ))}
                    {packages.length === 0 && (
                      <div className="px-2 py-3 text-xs text-slate-400">
                        No packages yet — add one below
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {showAddPackage ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input
                      placeholder="Package name"
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      className="h-8 text-sm flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Monthly fee (৳)"
                      value={newPkgFee}
                      onChange={(e) => setNewPkgFee(e.target.value)}
                      className="h-8 text-sm sm:w-[150px]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddPackage}
                      disabled={addingPkg}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddPackage(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddPackage(true)}
                    className="flex items-center gap-1 text-xs text-[#3e0078] hover:underline mt-1"
                  >
                    <Plus className="w-3 h-3" /> Add new package
                  </button>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyFee"
            rules={{ required: "Monthly fee is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Fee (৳)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
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
                <FormLabel>Connection Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location dropdown */}
          <FormField
            control={form.control}
            name="location"
            rules={{ required: "Location is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc._id} value={loc.name}>
                        {loc.name}
                      </SelectItem>
                    ))}
                    {locations.length === 0 && (
                      <div className="px-2 py-3 text-xs text-slate-400">
                        No locations yet — add one below
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {showAddLocation ? (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input
                      placeholder="Location name"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddLocation())
                      }
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddLocation}
                      disabled={addingLoc}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddLocation(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddLocation(true)}
                    className="flex items-center gap-1 text-xs text-[#3e0078] hover:underline mt-1"
                  >
                    <Plus className="w-3 h-3" /> Add new location
                  </button>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="router"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Router</FormLabel>
                <FormControl>
                  <Input placeholder="Router model" {...field} />
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
                <FormLabel>IP Address</FormLabel>
                <FormControl>
                  <Input placeholder="IP address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
        </div>


        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {customer ? "Update Customer" : "Add Customer"}
        </Button>
      </form>
    </Form>
  );
}
