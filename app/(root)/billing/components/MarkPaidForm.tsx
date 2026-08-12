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
  const currentBillRemaining = Math.max(bill.amount - paidSoFar, 0);

  // Suggested = remaining on this bill + any older month due − any older month advance
  const suggestedPaidAmount = Math.max(
    currentBillRemaining + previousDueAmount - previousAdvanceAmount,
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

  const newPayment = Number(form.watch("paidAmount")) || 0;
  const totalPaidForBill = paidSoFar + newPayment;
  const afterPaymentDue = Math.max(bill.amount - totalPaidForBill, 0);
  const afterPaymentAdvance = Math.max(newPayment - suggestedPaidAmount, 0);
  const isFullyPaid = afterPaymentDue === 0;
  const hasExistingBalance = previousDueAmount > 0 || previousAdvanceAmount > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-0">

        {/* ── Scrollable body ───────────────────────────── */}
        <div className="max-h-[58vh] overflow-y-auto space-y-4 pr-1 pb-4">

          {/* ── Summary Card ──────────────────────────────── */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 overflow-hidden">

            {/* Bill amount header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <span className="text-[13px] font-semibold text-slate-500">Bill Amount</span>
              <div className="text-right">
                <span className="text-[15px] font-extrabold text-slate-900">
                  ৳{bill.amount.toFixed(2)}
                </span>
                {paidSoFar > 0 && (
                  <span className="ml-2 text-[12px] font-semibold text-emerald-600">
                    (৳{paidSoFar.toFixed(2)} paid)
                  </span>
                )}
              </div>
            </div>

            {/* DUE / ADVANCE chips */}
            <div className="grid grid-cols-2 gap-3 px-4 pb-3">
              <div
                className={`rounded-xl border p-3.5 transition-colors ${
                  afterPaymentDue > 0
                    ? "border-amber-200 bg-amber-50"
                    : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                    afterPaymentDue > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  Due
                </p>
                <p
                  className={`text-[17px] font-black leading-none ${
                    afterPaymentDue > 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  ৳{afterPaymentDue.toFixed(2)}
                </p>
              </div>

              <div
                className={`rounded-xl border p-3.5 transition-colors ${
                  afterPaymentAdvance > 0
                    ? "border-cyan-200 bg-cyan-50"
                    : "border-slate-200 bg-slate-100/60"
                }`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                    afterPaymentAdvance > 0 ? "text-cyan-600" : "text-slate-400"
                  }`}
                >
                  Advance
                </p>
                <p
                  className={`text-[17px] font-black leading-none ${
                    afterPaymentAdvance > 0 ? "text-cyan-700" : "text-slate-400"
                  }`}
                >
                  ৳{afterPaymentAdvance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Previous month balance strip (if any) */}
            {hasExistingBalance && (
              <div className="mx-4 mb-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/60 px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-1.5">
                  Carried Over from Previous Month
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-rose-400 font-medium">Existing Due</p>
                    <p className="text-[14px] font-extrabold text-rose-700">
                      ৳{previousDueAmount.toFixed(2)}
                    </p>
                  </div>
                  {previousAdvanceAmount > 0 && (
                    <div className="text-right">
                      <p className="text-[11px] text-sky-400 font-medium">Existing Advance</p>
                      <p className="text-[14px] font-extrabold text-sky-700">
                        ৳{previousAdvanceAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggested payment row */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-t ${
                isFullyPaid ? "border-emerald-100 bg-emerald-50/50" : "border-slate-100 bg-white"
              }`}
            >
              <span className="text-[13px] font-semibold text-slate-500">
                Suggested Payment
              </span>
              <span
                className={`text-[15px] font-extrabold ${
                  isFullyPaid ? "text-emerald-600" : "text-violet-700"
                }`}
              >
                ৳{suggestedPaidAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Paid Amount ───────────────────────────────── */}
          <FormField
            control={form.control}
            name="paidAmount"
            rules={{
              required: "Paid amount is required",
              min: { value: 0, message: "Paid amount cannot be negative" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold text-slate-700">
                  Paid Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-xl border-slate-200 text-[15px] font-bold h-11"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Payment Date ──────────────────────────────── */}
          <FormField
            control={form.control}
            name="paymentDate"
            rules={{ required: "Payment date is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold text-slate-700">
                  Payment Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="rounded-xl border-slate-200 h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Payment Method ────────────────────────────── */}
          <FormField
            control={form.control}
            name="paymentMethod"
            rules={{ required: "Payment method is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold text-slate-700">
                  Payment Method
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11">
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

          {/* ── Remarks ───────────────────────────────────── */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-semibold text-slate-700">
                  Remarks <span className="text-slate-400 font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional remarks…"
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

        {/* ── Fixed footer button ───────────────────────── */}
        <div className="pt-3 border-t border-slate-100 mt-1">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-[14px] font-bold tracking-wide bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 shadow-md shadow-purple-200 transition-all"
          >
            {isFullyPaid ? "✓ Confirm Full Payment" : "Confirm Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
