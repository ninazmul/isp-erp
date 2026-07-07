"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-hot-toast";
import { updateSettings } from "@/lib/actions/setting.actions";
import type { Settings } from "@/types";

interface SettingsFormData {
  companyName: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  invoicePrefix: string;
  currency: string;
}

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormData>({
    defaultValues: {
      companyName: initialSettings.companyName || "",
      logo: initialSettings.logo || "",
      phone: initialSettings.phone || "",
      email: initialSettings.email || "",
      address: initialSettings.address || "",
      invoicePrefix: initialSettings.invoicePrefix || "INV",
      currency: initialSettings.currency || "BDT",
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    try {
      await updateSettings(data);
      toast.success("Settings updated successfully!");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                rules={{ required: "Company name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Logo URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
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
                name="invoicePrefix"
                rules={{ required: "Invoice prefix is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="INV" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                rules={{ required: "Currency is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="BDT" {...field} />
                    </FormControl>
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
                    <Textarea placeholder="Company address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
