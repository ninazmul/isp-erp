"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBills, getExpenses, getIncomes } from "@/lib/actions";
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface Bill {
  _id: string;
  invoiceNumber: string;
  customer: { name: string };
  amount: number;
  status: string;
  paymentDate?: Date;
}

interface Expense {
  _id: string;
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  reference?: string;
}

interface Income {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
}

export default function ReportsPage() {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const loadData = useCallback(async () => {
    const m = parseInt(month);
    const y = parseInt(year);
    const [billsRes, expensesRes, incomesRes] = await Promise.all([
      getBills({ month: m, year: y, limit: 1000 }),
      getExpenses({ month: m, year: y, limit: 1000 }),
      getIncomes({ month: m, year: y, limit: 1000 }),
    ]);
    setBills(billsRes.bills);
    setExpenses(expensesRes.expenses);
    setIncomes(incomesRes.incomes);
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const billingIncome = bills
    .filter((b) => b.status === "Paid")
    .reduce((sum, b) => sum + b.amount, 0);

  const manualIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalRevenue = billingIncome + manualIncome;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalDue = bills
    .filter((b) => b.status === "Unpaid")
    .reduce((sum, b) => sum + b.amount, 0);

  const exportToCSV = <T extends object>(data: T[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => JSON.stringify(row[header as keyof T] as unknown))
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthLabel = new Date(0, parseInt(month) - 1).toLocaleString("default", { month: "long" });

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-[#3e0078]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Financial Reports & Audits
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive statement for {monthLabel} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full sm:w-[110px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600">৳{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Billing + Manual Income</p>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-600">৳{totalExpenses.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Operational Outflows</p>
        </Card>

        <Card className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-[#3e0078]">Net Margin</span>
            <DollarSign className="w-4 h-4 text-[#3e0078]" />
          </div>
          <p className={`text-xl font-extrabold ${netProfit >= 0 ? "text-[#3e0078]" : "text-rose-600"}`}>
            {netProfit >= 0 ? "+" : ""}৳{netProfit.toFixed(2)}
          </p>
          <p className="text-[10px] text-purple-700/80 font-medium mt-1">Revenue - Expenses</p>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400">Pending Receivables</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">৳{totalDue.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Unpaid Billing Invoices</p>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="income" className="rounded-lg text-xs font-semibold">
            Billing Income ({bills.filter((b) => b.status === "Paid").length})
          </TabsTrigger>
          <TabsTrigger value="manual-income" className="rounded-lg text-xs font-semibold">
            Manual Income ({incomes.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-xs font-semibold">
            Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="due" className="rounded-lg text-xs font-semibold">
            Unpaid Dues ({bills.filter((b) => b.status === "Unpaid").length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Billing Income */}
        <TabsContent value="income">
          <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Billing Collection Report — {monthLabel} {year}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs self-start sm:self-auto"
                onClick={() =>
                  exportToCSV(
                    bills.filter((b) => b.status === "Paid"),
                    `billing-report-${month}-${year}.csv`
                  )
                }
              >
                <Download className="mr-2 h-4 w-4 text-emerald-600" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 text-xs">Invoice #</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Customer Name</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Amount</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.filter((b) => b.status === "Paid").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-400">
                        No billing payments in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    bills
                      .filter((b) => b.status === "Paid")
                      .map((bill) => (
                        <TableRow key={bill._id}>
                          <TableCell className="font-mono text-xs font-bold text-purple-900">{bill.invoiceNumber}</TableCell>
                          <TableCell className="font-medium text-sm text-slate-800">{bill.customer?.name ?? "—"}</TableCell>
                          <TableCell className="font-bold text-emerald-600">৳{bill.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Manual Income */}
        <TabsContent value="manual-income">
          <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Manual Income Receipts — {monthLabel} {year}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs self-start sm:self-auto"
                onClick={() => exportToCSV(incomes, `manual-income-${month}-${year}.csv`)}
              >
                <Download className="mr-2 h-4 w-4 text-cyan-600" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 text-xs">Category</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Amount</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Date</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Payment Method</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                        No manual income receipts in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomes.map((inc) => (
                      <TableRow key={inc._id}>
                        <TableCell className="font-semibold text-slate-800">{inc.category}</TableCell>
                        <TableCell className="font-bold text-cyan-600">৳{inc.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(inc.incomeDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{inc.paymentMethod}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-400">{inc.reference || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Expenses */}
        <TabsContent value="expenses">
          <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Expense Outflow Report — {monthLabel} {year}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs self-start sm:self-auto"
                onClick={() => exportToCSV(expenses, `expense-report-${month}-${year}.csv`)}
              >
                <Download className="mr-2 h-4 w-4 text-rose-600" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 text-xs">Category</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Amount</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Date</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Payment Method</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                        No expenses logged in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-semibold text-slate-800">{expense.category}</TableCell>
                        <TableCell className="font-bold text-rose-600">৳{expense.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{expense.paymentMethod}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-400">{expense.reference || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Due Report */}
        <TabsContent value="due">
          <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Pending Due Report — {monthLabel} {year}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs self-start sm:self-auto"
                onClick={() =>
                  exportToCSV(
                    bills.filter((b) => b.status === "Unpaid"),
                    `due-report-${month}-${year}.csv`
                  )
                }
              >
                <Download className="mr-2 h-4 w-4 text-amber-600" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 text-xs">Invoice #</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Customer Name</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs">Amount Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.filter((b) => b.status === "Unpaid").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-xs text-slate-400">
                        No unpaid dues in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    bills
                      .filter((b) => b.status === "Unpaid")
                      .map((bill) => (
                        <TableRow key={bill._id}>
                          <TableCell className="font-mono text-xs font-bold text-purple-900">{bill.invoiceNumber}</TableCell>
                          <TableCell className="font-medium text-sm text-slate-800">{bill.customer?.name ?? "—"}</TableCell>
                          <TableCell className="font-bold text-amber-600">৳{bill.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
