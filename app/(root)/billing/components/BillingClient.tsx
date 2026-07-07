"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getBills,
  generateMonthlyBills,
  markBillAsPaid,
} from "@/lib/actions/bill.actions";
import GenerateBillsForm from "./GenerateBillsForm";
import MarkPaidForm from "./MarkPaidForm";
import InvoiceDownloader from "../../components/InvoiceDownloader";
import type { Bill } from "@/types";

export default function BillingClient({
  initialBills,
}: {
  initialBills: Bill[];
}) {
  const [bills, setBills] = useState(initialBills);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState("");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [markingBill, setMarkingBill] = useState<Bill | null>(null);

  const loadBills = useCallback(async () => {
    const { bills: newBills } = await getBills({
      month: month ? parseInt(month) : undefined,
      year: parseInt(year),
      status,
      search,
    });
    setBills(newBills);
  }, [search, month, year, status]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleGenerate = async (data: { month: number; year: number }) => {
    try {
      const result = await generateMonthlyBills(data.month, data.year);
      toast.success(
        `Generated ${result.generated} bills, skipped ${result.skipped} existing bills`,
      );
      setIsGenerateOpen(false);
      loadBills();
    } catch {
      toast.error("Failed to generate bills");
    }
  };

  const handleMarkPaid = async (data: {
    paymentDate: string;
    paymentMethod: string;
    remarks?: string;
  }) => {
    if (!markingBill) return;
    try {
      await markBillAsPaid(markingBill._id, {
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        remarks: data.remarks,
      });
      toast.success("Bill marked as paid");
      setIsMarkPaidOpen(false);
      setMarkingBill(null);
      loadBills();
    } catch {
      toast.error("Failed to mark bill as paid");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "default";
      case "Unpaid":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing</h1>
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Generate Monthly Bills
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Generate Monthly Bills</DialogTitle>
            </DialogHeader>
            <GenerateBillsForm onSubmit={handleGenerate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search bills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i,
            ).map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status || "all"}
          onValueChange={(value) => setStatus(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Month/Year</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill._id}>
                <TableCell>{bill.invoiceNumber}</TableCell>
                <TableCell>{bill.customer.name}</TableCell>
                <TableCell>
                  {new Date(0, bill.month - 1).toLocaleString("default", {
                    month: "long",
                  })}{" "}
                  {bill.year}
                </TableCell>
                <TableCell>৳{bill.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeColor(bill.status)}>
                    {bill.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {bill.paymentDate
                    ? new Date(bill.paymentDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="flex gap-2">
                  {bill.status === "Unpaid" && (
                    <Dialog
                      open={isMarkPaidOpen && markingBill?._id === bill._id}
                      onOpenChange={(open) => {
                        setIsMarkPaidOpen(open);
                        if (!open) setMarkingBill(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setMarkingBill(bill)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle>Mark Bill as Paid</DialogTitle>
                        </DialogHeader>
                        <MarkPaidForm onSubmit={handleMarkPaid} />
                      </DialogContent>
                    </Dialog>
                  )}
                  <InvoiceDownloader bill={bill} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
