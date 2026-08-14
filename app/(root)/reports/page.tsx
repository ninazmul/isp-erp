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
import { getExpenses, getIncomes } from "@/lib/actions";
import { Download, FileText, TrendingUp, DollarSign, Wallet, FileSpreadsheet, Percent } from "lucide-react";
import { exportToExcel, exportMultiSheetExcel } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

interface Income {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    const m = month === "all" ? undefined : parseInt(month, 10);
    const y = parseInt(year, 10);
    const [expensesRes, incomesRes] = await Promise.all([
      getExpenses({ month: m, year: y, limit: 1000 }),
      getIncomes({ month: m, year: y, limit: 1000 }),
    ]);
    setExpenses(expensesRes.expenses);
    setIncomes(incomesRes.incomes);
  }, [month, year]);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [loadData, mounted]);

  if (!mounted) {
    return (
      <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400 font-medium">Loading reports...</div>
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  // ── Excel export helpers ────────────────────────────────────────────────
  const INCOME_HEADERS = ["Category", "Amount", "Date", "Payment Method", "Reference", "Description"];
  const EXPENSE_HEADERS = ["Category", "Amount", "Date", "Payment Method", "Reference", "Description"];

  const getIncomeRows = () =>
    incomes.map((inc) => ({
      Category: inc.category,
      Amount: inc.amount,
      Date: formatDate(inc.incomeDate),
      "Payment Method": inc.paymentMethod,
      Reference: inc.reference ?? "—",
      Description: inc.description ?? "—",
    }));

  const getExpenseRows = () =>
    expenses.map((exp) => ({
      Category: exp.category,
      Amount: exp.amount,
      Date: formatDate(exp.expenseDate),
      "Payment Method": exp.paymentMethod,
      Reference: exp.reference ?? "—",
      Description: exp.description ?? "—",
    }));

  const handleExportIncome = () =>
    exportToExcel(getIncomeRows(), INCOME_HEADERS, "Income", `income-report-${month}-${year}.xlsx`);

  const handleExportExpenses = () =>
    exportToExcel(getExpenseRows(), EXPENSE_HEADERS, "Expenses", `expense-report-${month}-${year}.xlsx`);

  const monthLabel = month === "all" ? "All Months" : new Date(0, parseInt(month) - 1).toLocaleString("default", { month: "long" });

  const handleExportFullReport = () => {
    const summaryRows = [
      { Metric: "Total Income", Value: totalIncome },
      { Metric: "Total Expenses", Value: totalExpenses },
      { Metric: "Net Profit / Loss", Value: netProfit },
      { Metric: "Profit Margin (%)", Value: `${profitMargin}%` },
    ];
    exportMultiSheetExcel(
      [
        { name: "Executive Summary", data: summaryRows, headers: ["Metric", "Value"] },
        { name: "Income Receipts", data: getIncomeRows(), headers: INCOME_HEADERS },
        { name: "Expense Outflows", data: getExpenseRows(), headers: EXPENSE_HEADERS },
      ],
      `full-financial-report-${monthLabel}-${year}.xlsx`
    );
  };

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
              Comprehensive income & expense statement for {monthLabel} {year}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
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
          <Button
            onClick={handleExportFullReport}
            className="h-9 bg-[#3e0078] hover:bg-[#52029d] text-white rounded-xl text-xs gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Full Report (.xlsx)
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Total Income */}
        <Card className="p-4 rounded-2xl border border-emerald-200/70 border-t-4 border-t-emerald-600 bg-gradient-to-br from-emerald-50/50 via-white to-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700">৳{totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">All revenue inflows</p>
        </Card>

        {/* 2. Total Expense */}
        <Card className="p-4 rounded-2xl border border-rose-200/70 border-t-4 border-t-rose-600 bg-gradient-to-br from-rose-50/50 via-white to-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Total Expense</span>
            <Wallet className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-700">৳{totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Operational outflows</p>
        </Card>

        {/* 3. Net Profit / Loss */}
        <Card className={`p-4 rounded-2xl border border-t-4 shadow-sm ${
          netProfit >= 0
            ? "border-purple-300 border-t-purple-700 bg-gradient-to-br from-purple-100/60 via-purple-50/30 to-white"
            : "border-rose-300 border-t-rose-700 bg-gradient-to-br from-rose-100/60 via-rose-50/30 to-white"
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Net Profit / Loss</span>
            <DollarSign className={`w-4 h-4 ${netProfit >= 0 ? "text-[#3e0078]" : "text-rose-600"}`} />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${netProfit >= 0 ? "text-[#3e0078]" : "text-rose-700"}`}>
            {netProfit >= 0 ? "+" : ""}৳{netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Income − Expense</p>
        </Card>

        {/* 4. Profit Margin */}
        <Card className="p-4 rounded-2xl border border-indigo-200/70 border-t-4 border-t-indigo-600 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profit Margin</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-700">{profitMargin}%</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Net Profit / Total Income</p>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="income" className="rounded-lg text-xs font-semibold">
            Income Receipts ({incomes.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-xs font-semibold">
            Expenses Outflows ({expenses.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Income */}
        <TabsContent value="income">
          <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Income Statement — {monthLabel} {year}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-emerald-200 text-emerald-700 text-xs hover:bg-emerald-50 self-start sm:self-auto gap-1.5"
                onClick={handleExportIncome}
              >
                <Download className="h-3.5 w-3.5" /> Export Excel
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
                    <TableHead className="font-bold text-slate-700 text-xs">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                        No income receipts in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomes.map((inc) => (
                      <TableRow key={inc._id}>
                        <TableCell className="font-semibold text-slate-800">{inc.category}</TableCell>
                        <TableCell className="font-bold text-emerald-600">৳{inc.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(inc.incomeDate)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{inc.paymentMethod}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-400">{inc.reference || "—"}</TableCell>
                        <TableCell className="text-xs text-slate-500">{inc.description || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Expenses */}
        <TabsContent value="expenses">
          <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Expense Outflow Report — {monthLabel} {year}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-rose-200 text-rose-700 text-xs hover:bg-rose-50 self-start sm:self-auto gap-1.5"
                onClick={handleExportExpenses}
              >
                <Download className="h-3.5 w-3.5" /> Export Excel
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
                    <TableHead className="font-bold text-slate-700 text-xs">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                        No expenses logged in this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-semibold text-slate-800">{expense.category}</TableCell>
                        <TableCell className="font-bold text-rose-600">৳{expense.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(expense.expenseDate)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{expense.paymentMethod}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-400">{expense.reference || "—"}</TableCell>
                        <TableCell className="text-xs text-slate-500">{expense.description || "—"}</TableCell>
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
