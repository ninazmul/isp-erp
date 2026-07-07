"use client";

import { useForm } from "react-hook-form";
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

// Define types
interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
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
  address: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: string;
  router: string;
  ipAddress: string;
  status: string;
  notes: string;
}

export default function CustomerForm({
  customer,
  onSuccess,
}: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    defaultValues: customer
      ? {
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? "",
          address: customer.address ?? "",
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
          address: "",
          packageName: "",
          monthlyFee: 0,
          connectionDate: new Date().toISOString().split("T")[0],
          router: "",
          ipAddress: "",
          status: "Active",
          notes: "",
        },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (customer) {
        await updateCustomer(customer._id, {
          ...data,
          connectionDate: new Date(data.connectionDate),
        });
      } else {
        await createCustomer({
          ...data,
          connectionDate: new Date(data.connectionDate),
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving customer:", error);
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

          <FormField
            control={form.control}
            name="packageName"
            rules={{ required: "Package name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 10 Mbps" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyFee"
            rules={{ required: "Monthly fee is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Customer address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
