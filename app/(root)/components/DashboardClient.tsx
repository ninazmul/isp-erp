"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PieChart as PieChartIcon,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Payment {
  _id: string;
  customer: { name: string };
  invoiceNumber: string;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  advanceAmount?: number;
  paymentDate: Date;
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

type DashboardClientProps = {
  data: {
    customers: {
      total: number;
      active: number;
      inactive: number;
      disconnected: number;
    };
    billing: {
      currentMonthCollection: number;
      currentMonthDue: number;
      currentMonthAdvance: number;
      currentMonthManualIncome: number;
      currentMonthTotalIncome: number;
      currentMonthExpenses: number;
      currentMonthProfit: number;
    };
    charts: {
      monthly: {
        month: string;
        billingIncome: number;
        manualIncome: number;
        expenses: number;
      }[];
      expenseCategories: {
        name: string;
        value: number;
      }[];
    };
    recent: {
      payments: Payment[];
      expenses: Expense[];
      incomes: Income[];
    };
  };
  selectedMonth?: number;
  selectedYear?: number;
};

interface CustomTooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_COLORS = [
  "#f43f5e", // Rose
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#a855f7", // Purple Light
];

const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-xl shadow-xl space-y-1 text-xs">
        <p className="font-bold text-slate-700 mb-1 border-b border-slate-100 pb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center justify-between gap-4 font-medium"
          >
            <span
              className="flex items-center gap-1.5"
              style={{ color: entry.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-800">
              ৳
              {Number(entry.value).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomExpenseTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.name}
        </p>
        <p className="font-extrabold text-rose-700 text-sm">
          ৳
          {Number(item.value).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardClient({
  data,
  selectedMonth,
  selectedYear,
}: DashboardClientProps) {
  const isProfit = data.billing.currentMonthProfit >= 0;
  const getPaymentAmount = (payment: Payment) =>
    payment.paidAmount ?? payment.amount;

  const now = new Date();
  const isAllTime = selectedMonth === 0;
  const displayHeaderLabel = isAllTime
    ? "All Time"
    : `${selectedMonth ? MONTH_NAMES[selectedMonth - 1] : MONTH_NAMES[now.getMonth()]} ${
        selectedYear || now.getFullYear()
      }`;

  return (
    <div className="py-4 flex flex-col gap-6 px-3 lg:px-6">
      {/* ── Financial Summary ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          {displayHeaderLabel} Financial Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 auto-rows-fr">
          {/* 1. Total Income */}
          <Card className="p-5 rounded-2xl border border-emerald-200/70 border-t-4 border-t-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50/50 via-white to-white h-full min-h-[130px]">
            <div className="flex items-center gap-4 h-full">
              <div className="flex-shrink-0 p-3.5 rounded-xl bg-emerald-100/80 text-emerald-700 shadow-2xs">
                <DollarSign className="w-7 h-7" />
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                <span className="text-xs font-bold text-emerald-900 leading-none uppercase tracking-wider">
                  Total Income
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 leading-tight break-words min-w-0 truncate">
                  ৳
                  {data.billing.currentMonthTotalIncome.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Billing: ৳{data.billing.currentMonthCollection.toLocaleString()} | Manual: ৳{data.billing.currentMonthManualIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* 2. Total Expense */}
          <Card className="p-5 rounded-2xl border border-rose-200/70 border-t-4 border-t-rose-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-rose-50/50 via-white to-white h-full min-h-[130px]">
            <div className="flex items-center gap-4 h-full">
              <div className="flex-shrink-0 p-3.5 rounded-xl bg-rose-100/80 text-rose-700 shadow-2xs">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                <span className="text-xs font-bold text-rose-900 leading-none uppercase tracking-wider">
                  Total Expense
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-700 leading-tight break-words min-w-0 truncate">
                  ৳
                  {data.billing.currentMonthExpenses.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Operational & overhead costs
                </span>
              </div>
            </div>
          </Card>

          {/* 3. Balance / Profit */}
          <Card
            className={`p-5 rounded-2xl border border-t-4 shadow-md hover:shadow-lg transition-all duration-200 h-full min-h-[130px] ${isProfit
                ? "border-purple-300 border-t-purple-700 bg-gradient-to-br from-purple-100/60 via-purple-50/30 to-white"
                : "border-rose-300 border-t-rose-700 bg-gradient-to-br from-rose-100/60 via-rose-50/30 to-white"
              }`}
          >
            <div className="flex items-center gap-4 h-full">
              <div
                className={`flex-shrink-0 p-3.5 rounded-xl shadow-2xs ${isProfit
                    ? "bg-purple-100/80 text-[#3e0078]"
                    : "bg-rose-100/80 text-rose-700"
                  }`}
              >
                {isProfit ? (
                  <ArrowUpRight className="w-7 h-7" />
                ) : (
                  <ArrowDownRight className="w-7 h-7" />
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 leading-none uppercase tracking-wider">
                    Balance / Profit
                  </span>
                  <Badge
                    variant={isProfit ? "default" : "destructive"}
                    className={
                      isProfit
                        ? "text-[9px] py-0.5 px-2 font-extrabold bg-[#3e0078] text-white shadow-2xs"
                        : "text-[9px] py-0.5 px-2 font-extrabold bg-rose-600 text-white shadow-2xs"
                    }
                  >
                    {isProfit ? "NET PROFIT" : "NET LOSS"}
                  </Badge>
                </div>
                <h3
                  className={`text-2xl sm:text-3xl font-black leading-tight break-words min-w-0 truncate ${isProfit ? "text-[#3e0078]" : "text-rose-700"
                    }`}
                >
                  {isProfit ? "+" : ""}৳
                  {data.billing.currentMonthProfit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Net earnings (Income - Expense)
                </span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Charts Grid: 6-Month Trend & Expense Breakdown ────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6-Month Performance Trend Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              6-Month Performance Trend
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Billing vs Manual Income vs Expenses
            </span>
          </div>
          <Card className="p-5 rounded-2xl border border-slate-100 border-t-4 border-t-purple-600 shadow-sm bg-white flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data.charts.monthly}
                margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                <Bar
                  dataKey="billingIncome"
                  name="Billing Collection"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="manualIncome"
                  name="Manual Income"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expense Category Breakdown Pie / Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              Expense Breakdown
            </h2>
            <Link
              href="/expenses"
              className="text-xs font-bold text-[#3e0078] hover:underline"
            >
              View Expenses →
            </Link>
          </div>
          <Card className="p-5 rounded-2xl border border-slate-100 border-t-4 border-t-rose-600 shadow-sm bg-white flex-1 min-h-[350px] flex flex-col justify-between">
            {data.charts.expenseCategories && data.charts.expenseCategories.length > 0 ? (
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="relative w-full h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomExpenseTooltip />} />
                      <Pie
                        data={data.charts.expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.charts.expenseCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Donut Center Total display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
                    <span className="text-sm font-black text-slate-800">
                      ৳{data.billing.currentMonthExpenses.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Category List Details */}
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {data.charts.expenseCategories.map((cat, index) => {
                    const pct = data.billing.currentMonthExpenses > 0
                      ? ((cat.value / data.billing.currentMonthExpenses) * 100).toFixed(1)
                      : "0";
                    return (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            }}
                          />
                          <span className="font-bold text-slate-700 truncate">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-extrabold text-slate-900">
                            ৳{cat.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="p-3 rounded-full bg-rose-50 text-rose-400 mb-2">
                  <PieChartIcon className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-600">No Expenses Recorded</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  No category expenses have been logged for this month yet.
                </p>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ── Recent Activity Feeds ─────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Live Activity Streams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Billing Collections */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-emerald-600 shadow-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Receipt className="w-4 h-4" />
                </span>
                Billing Payments
              </h3>
              <Link
                href="/billing"
                className="text-[11px] font-bold text-[#3e0078] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent.payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No recent billing payments
                </p>
              ) : (
                data.recent.payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200/60 transition-all"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        {payment.customer?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-purple-700 font-mono font-bold mt-0.5">
                        {payment.invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-xs text-emerald-600">
                        +৳{getPaymentAmount(payment).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Manual Income */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-cyan-600 shadow-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Manual Receipts
              </h3>
              <Link
                href="/income"
                className="text-[11px] font-bold text-[#3e0078] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent.incomes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No recent manual income
                </p>
              ) : (
                data.recent.incomes.map((income) => (
                  <div
                    key={income._id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-cyan-50/50 hover:border-cyan-200/60 transition-all"
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800 mb-0.5">
                        {income.category}
                      </span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[120px] font-medium">
                        {income.reference || income.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-xs text-cyan-600">
                        +৳{income.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatDate(income.incomeDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Expenses */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-rose-600 shadow-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <TrendingDown className="w-4 h-4" />
                </span>
                Expenses
              </h3>
              <Link
                href="/expenses"
                className="text-[11px] font-bold text-[#3e0078] hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent.expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No recent expenses
                </p>
              ) : (
                data.recent.expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-rose-50/50 hover:border-rose-200/60 transition-all"
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 mb-0.5">
                        {expense.category}
                      </span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[120px] font-medium">
                        {expense.reference || expense.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-xs text-rose-600">
                        -৳{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatDate(expense.expenseDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
