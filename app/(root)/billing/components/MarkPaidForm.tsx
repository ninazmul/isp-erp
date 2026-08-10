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
import type { Bill } from "@/types";

interface MarkPaidFormProps {
  bill: Bill;
  onSubmit: (data: {
    paymentDate: string;
    paymentMethod: string;
    paidAmount: number;
    remarks?: string;
  }) => void;
}

type MarkPaidFormValues = {
  paymentDate: string;
  paymentMethod: string;
  paidAmount: number;
  remarks: string;
};

export default function MarkPaidForm({ bill, onSubmit }: MarkPaidFormProps) {
  const form = useForm<MarkPaidFormValues>({
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      paidAmount: bill.amount,
      remarks: "",
    },
  });

  const paidAmount = Number(form.watch("paidAmount")) || 0;
  const dueAmount = Math.max(bill.amount - paidAmount, 0);
  const advanceAmount = Math.max(paidAmount - bill.amount, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Bill Amount</span>
            <span className="font-extrabold text-slate-900">
              ৳{bill.amount.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[11px] font-bold uppercase text-amber-700">
                Due
              </p>
              <p className="text-base font-black text-amber-800">
                ৳{dueAmount.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
              <p className="text-[11px] font-bold uppercase text-cyan-700">
                Advance
              </p>
              <p className="text-base font-black text-cyan-800">
                ৳{advanceAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="paidAmount"
          rules={{
            required: "Paid amount is required",
            min: { value: 0, message: "Paid amount cannot be negative" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paid Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentDate"
          rules={{ required: "Payment date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          rules={{ required: "Payment method is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bkash">Bkash</SelectItem>
                  <SelectItem value="Rocket">Rocket</SelectItem>
                  <SelectItem value="Nagad">Nagad</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional remarks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Confirm Payment
        </Button>
      </form>
    </Form>
  );
}
