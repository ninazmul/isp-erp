"use client";

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
import type { ResellerBill } from "@/types";
import { PAYMENT_METHODS } from "@/lib/constants";

interface MarkResellerPaidFormProps {
  bill: ResellerBill;
  onSubmit: (data: {
    amount?: number;
    paymentDate: string;
    paymentMethod: string;
    remarks?: string;
  }) => void;
  isLoading?: boolean;
}

type MarkResellerPaidFormValues = {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  remarks: string;
};

export default function MarkResellerPaidForm({
  bill,
  onSubmit,
  isLoading = false,
}: MarkResellerPaidFormProps) {
  const form = useForm<MarkResellerPaidFormValues>({
    defaultValues: {
      amount: bill.amount,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      remarks: bill.remarks || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Reseller Info header */}
        <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-violet-900">
              {bill.reseller?.name} ({bill.reseller?.resellerCode})
            </span>
            <span className="font-mono text-xs font-bold text-violet-700">
              {bill.invoiceNumber}
            </span>
          </div>
          <p className="text-[11px] text-violet-700">
            Location: {bill.reseller?.location}
          </p>
        </div>

        {/* Bill Amount — editable here too if needed */}
        <FormField
          control={form.control}
          name="amount"
          rules={{
            required: "Amount is required",
            min: { value: 0, message: "Amount cannot be negative" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-slate-700">
                Payment Amount (৳) *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="rounded-xl border-slate-200 text-base font-bold text-emerald-800 bg-emerald-50/30"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Date */}
        <FormField
          control={form.control}
          name="paymentDate"
          rules={{ required: "Payment date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-slate-700">
                Payment Date *
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

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethod"
          rules={{ required: "Payment method is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-slate-700">
                Payment Method *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-slate-700">
                Remarks / Transaction Reference (optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Bank ref, check number, or transaction notes..."
                  className="rounded-xl border-slate-200 resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl text-sm font-bold tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md text-white"
          >
            {isLoading ? "Recording..." : "✓ Confirm Payment as Paid"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
