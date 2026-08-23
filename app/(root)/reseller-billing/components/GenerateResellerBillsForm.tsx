"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

interface GenerateResellerBillsFormProps {
  onSubmit: (data: { month: number; year: number }) => void;
  isLoading?: boolean;
}

export default function GenerateResellerBillsForm({
  onSubmit,
  isLoading = false,
}: GenerateResellerBillsFormProps) {
  const form = useForm({
    defaultValues: {
      month: (new Date().getMonth() + 1).toString(),
      year: new Date().getFullYear().toString(),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          onSubmit({ month: parseInt(data.month), year: parseInt(data.year) })
        )}
        className="space-y-4"
      >
        <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto space-y-4 pr-3 pb-4">
          <FormField
            control={form.control}
            name="month"
            rules={{ required: "Month is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700">Billing Month</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            rules={{ required: "Year is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700">Billing Year</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white rounded-xl font-bold text-sm h-10 shadow-sm"
          >
            {isLoading ? "Generating..." : "Generate Reseller Bills"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
