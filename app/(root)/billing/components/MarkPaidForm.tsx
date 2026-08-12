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
import { PAYMENT_METHODS } from "@/lib/constants";

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
  const previousDueAmount = bill.previousDueAmount ?? 0;
  const previousAdvanceAmount = bill.previousAdvanceAmount ?? 0;
  const paidSoFar = bill.paidAmount ?? (bill.status === "Paid" ? bill.amount : 0);
  const currentDueAmount =
    paidSoFar > 0
      ? bill.dueAmount ?? Math.max(bill.amount - paidSoFar, 0)
      : 0;
  const currentAdvanceAmount = bill.advanceAmount ?? 0;
  const balanceDueAmount = previousDueAmount + currentDueAmount;
  const balanceAdvanceAmount = previousAdvanceAmount + currentAdvanceAmount;
  const suggestedPaidAmount = Math.max(
    bill.amount + balanceDueAmount - balanceAdvanceAmount,
    0
  );

  const form = useForm<MarkPaidFormValues>({
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      paidAmount: suggestedPaidAmount,
      remarks: "",
    },
  });

  const paidAmount = Number(form.watch("paidAmount")) || 0;
  const dueAmount = Math.max(bill.amount - paidAmount, 0);
  const advanceAmount = Math.max(paidAmount - suggestedPaidAmount, 0);
  const hasExistingBalance = balanceDueAmount > 0 || balanceAdvanceAmount > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto space-y-4 pr-3 pb-4">
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
            {hasExistingBalance && (
              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3">
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-[11px] font-bold uppercase text-rose-700">
                    Existing Due
                  </p>
                  <p className="text-base font-black text-rose-800">
                    ৳{balanceDueAmount.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                  <p className="text-[11px] font-bold uppercase text-sky-700">
                    Existing Advance
                  </p>
                  <p className="text-base font-black text-sky-800">
                    ৳{balanceAdvanceAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="font-medium text-slate-500">Suggested Payment</span>
              <span className="font-extrabold text-slate-900">
                ৳{suggestedPaidAmount.toFixed(2)}
              </span>
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
        </div>

        <div className="pt-2 border-t">
          <Button type="submit" className="w-full">
            Confirm Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
