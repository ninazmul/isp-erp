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

interface EditResellerBillFormProps {
  bill: ResellerBill;
  onSubmit: (data: {
    amount: number;
    status: "Paid" | "Unpaid";
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

type EditResellerBillValues = {
  amount: number;
  status: "Paid" | "Unpaid";
  paymentDate: string;
  paymentMethod: string;
  remarks: string;
};

export default function EditResellerBillForm({
  bill,
  onSubmit,
  isLoading = false,
}: EditResellerBillFormProps) {
  const form = useForm<EditResellerBillValues>({
    defaultValues: {
      amount: bill.amount,
      status: (bill.status as "Paid" | "Unpaid") || "Unpaid",
      paymentDate: bill.paymentDate
        ? new Date(bill.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentMethod: bill.paymentMethod || "Cash",
      remarks: bill.remarks || "",
    },
  });

  const watchStatus = form.watch("status");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Reseller Info Banner */}
        <div className="p-3.5 rounded-xl border border-violet-100 bg-violet-50/50 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-violet-900">
              {bill.reseller?.name} ({bill.reseller?.resellerCode})
            </p>
            <p className="text-[11px] text-violet-600">
              {bill.reseller?.location} • {bill.reseller?.packageDesc || "Custom Link"}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-extrabold text-violet-700">
              {bill.invoiceNumber}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Bill Amount — editable */}
          <FormField
            control={form.control}
            name="amount"
            rules={{
              required: "Bill amount is required",
              min: { value: 0, message: "Amount cannot be negative" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700">
                  Bill Amount (৳) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-xl border-slate-200 text-base font-bold text-slate-900"
                    placeholder="Enter customized monthly amount"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <p className="text-[11px] text-slate-400">
                  You can set any custom amount for this specific month&apos;s bill.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Status */}
          <FormField
            control={form.control}
            name="status"
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700">
                  Payment Status
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Details (Only when status is Paid) */}
          {watchStatus === "Paid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40">
              <FormField
                control={form.control}
                name="paymentDate"
                rules={{ required: "Payment date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Payment Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="rounded-xl border-slate-200 bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">
                      Payment Method
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                          <SelectValue placeholder="Payment method" />
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
            </div>
          )}

          {/* Remarks */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700">
                  Remarks / Notes (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Reason for adjustment, transaction reference, or notes..."
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

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white rounded-xl shadow-md font-bold text-sm h-10"
          >
            {isLoading ? "Saving..." : "Save Bill Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
