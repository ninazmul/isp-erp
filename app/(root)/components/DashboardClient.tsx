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
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Percent,
  Users,
  Receipt,
  Network,
  ReceiptText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
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

export type DashboardClientProps = {
  data: {
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netProfit: number;
    };
    customerBilling: {
      totalBilled: number;
      totalCollected: number;
      totalDue: number;
      totalBills: number;
      paidBills: number;
      unpaidBills: number;
      activeCustomers: number;
      totalCustomers: number;
      collectionRate: number;
    };
    resellerBilling: {
      totalBilled: number;
      totalCollected: number;
      totalPending: number;
      totalBills: number;
      paidBills: number;
      unpaidBills: number;
      activeResellers: number;
      totalResellers: number;
      activeClients: number;
      inactiveClients: number;
      collectionRate: number;
    };
    charts: {
      monthly: {
        month: string;
        income: number;
        expenses: number;
      }[];
      expenseCategories: {
        name: string;
        value: number;
      }[];
      incomeCategories: {
        name: string;
        value: number;
      }[];
    };
    recent: {
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

const COLORS = [
  "#3e0078",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100/80 text-xs font-sans">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
              <span className="font-extrabold text-slate-900 font-mono">
                ৳{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
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
  const isAllTime = selectedMonth === 0;

  const currentMonthName =
    selectedMonth && selectedMonth >= 1 && selectedMonth <= 12
      ? MONTH_NAMES[selectedMonth - 1]
      : MONTH_NAMES[new Date().getMonth()];

  const currentYearDisplay = selectedYear || new Date().getFullYear();

  const periodLabel = isAllTime
    ? "All Time"
    : `${currentMonthName} ${currentYearDisplay}`;

  const { totalIncome, totalExpenses, netProfit } = data.summary;
  const isProfitable = netProfit >= 0;
  const profitMargin =
    totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  const { customerBilling, resellerBilling } = data;

  return (
    <div className="p-3 sm:p-6 space-y-7 max-w-[1600px] mx-auto font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: FINANCIAL OVERVIEW
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Financial Overview
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Overall cashflow and net performance for {periodLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income */}
          <Card className="relative overflow-hidden p-5 rounded-2xl border border-emerald-200/70 border-t-4 border-t-emerald-600 bg-gradient-to-br from-emerald-50/50 via-white to-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Total Income
                </span>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {periodLabel}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight font-mono">
                ৳{totalIncome.toLocaleString()}
              </h3>
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Total cash inflows
              </p>
            </div>
          </Card>

          {/* Total Expenses */}
          <Card className="relative overflow-hidden p-5 rounded-2xl border border-rose-200/70 border-t-4 border-t-rose-600 bg-gradient-to-br from-rose-50/50 via-white to-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Total Expenses
                </span>
                <span className="text-[10px] font-extrabold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200/60">
                  {periodLabel}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight font-mono">
                ৳{totalExpenses.toLocaleString()}
              </h3>
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" /> Total cash outflows
              </p>
            </div>
          </Card>

          {/* Net Profit / Loss */}
          <Card
            className={`relative overflow-hidden p-5 rounded-2xl border border-t-4 shadow-sm hover:shadow-md transition-all ${
              isProfitable
                ? "border-purple-300 border-t-purple-700 bg-gradient-to-br from-purple-100/60 via-purple-50/30 to-white"
                : "border-rose-300 border-t-rose-700 bg-gradient-to-br from-rose-100/60 via-rose-50/30 to-white"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isProfitable ? "text-purple-900" : "text-rose-900"
                  }`}
                >
                  Net {isProfitable ? "Profit" : "Loss"}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                    isProfitable
                      ? "text-purple-800 bg-purple-100/80 border-purple-200/60"
                      : "text-rose-800 bg-rose-100/80 border-rose-200/60"
                  }`}
                >
                  {periodLabel}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl ${
                  isProfitable
                    ? "bg-purple-500/10 text-[#3e0078]"
                    : "bg-rose-500/10 text-rose-600"
                }`}
              >
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3
                className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                  isProfitable ? "text-[#3e0078]" : "text-rose-700"
                }`}
              >
                {netProfit >= 0 ? "+" : "-"}৳{Math.abs(netProfit).toLocaleString()}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    isProfitable
                      ? "bg-[#3e0078] text-white font-bold text-[10px]"
                      : "bg-rose-600 text-white font-bold text-[10px]"
                  }
                >
                  {isProfitable ? "Net Gain" : "Net Deficit"}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">
                  (Income − Expense)
                </span>
              </div>
            </div>
          </Card>

          {/* Profit Margin */}
          <Card className="relative overflow-hidden p-5 rounded-2xl border border-blue-200/70 border-t-4 border-t-blue-600 bg-gradient-to-br from-blue-50/50 via-white to-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Profit Margin
                </span>
                <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200/60">
                  {periodLabel}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight font-mono">
                {profitMargin}%
              </h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white font-bold text-[10px]">
                  Margin %
                </Badge>
                <span className="text-xs text-slate-500 font-medium">
                  (Net Profit ÷ Income)
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: CUSTOMER BILLING METRICS
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Customer Billing Metrics
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Subscriber revenue, collections, and dues for {periodLabel}
            </p>
          </div>
          <Link
            href="/billing"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
          >
            Go to Billing →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Billed */}
          <Card className="p-5 rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-600 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Total Billed
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ৳{customerBilling.totalBilled.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Across <strong className="text-slate-700">{customerBilling.totalBills}</strong> invoices generated
            </p>
          </Card>

          {/* Customer Collected */}
          <Card className="p-5 rounded-2xl border border-emerald-100 border-t-4 border-t-emerald-600 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Collected Amount
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              ৳{customerBilling.totalCollected.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                {customerBilling.collectionRate}% Collected
              </Badge>
              <span className="text-xs text-slate-400">
                ({customerBilling.paidBills} paid)
              </span>
            </div>
          </Card>

          {/* Customer Due */}
          <Card className="p-5 rounded-2xl border border-amber-100 border-t-4 border-t-amber-500 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Outstanding Dues
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-amber-700 font-mono tracking-tight">
              ৳{customerBilling.totalDue.toLocaleString()}
            </h3>
            <p className="text-xs text-amber-600/90 font-medium mt-1">
              <strong className="text-amber-800">{customerBilling.unpaidBills}</strong> unpaid / partially paid bills
            </p>
          </Card>

          {/* Customer Subscriber Count */}
          <Card className="p-5 rounded-2xl border border-slate-100 border-t-4 border-t-slate-700 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Customers
              </span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {customerBilling.activeCustomers.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Out of <strong className="text-slate-700">{customerBilling.totalCustomers}</strong> registered users
            </p>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: RESELLER BILLING METRICS (Clean Billed/Collected/Pending)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-violet-700" /> Reseller Billing Metrics
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Upstream distribution revenue and partner payments for {periodLabel}
            </p>
          </div>
          <Link
            href="/reseller-billing"
            className="text-xs font-bold text-violet-700 hover:text-violet-900 hover:underline flex items-center gap-1"
          >
            Go to Reseller Billing →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reseller Billed */}
          <Card className="p-5 rounded-2xl border border-violet-100 border-t-4 border-t-violet-700 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Total Billed
              </span>
              <div className="p-2 rounded-xl bg-violet-50 text-violet-700">
                <ReceiptText className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ৳{resellerBilling.totalBilled.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Across <strong className="text-slate-700">{resellerBilling.totalBills}</strong> partner invoices
            </p>
          </Card>

          {/* Reseller Collected */}
          <Card className="p-5 rounded-2xl border border-emerald-100 border-t-4 border-t-emerald-600 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Collected Amount
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              ৳{resellerBilling.totalCollected.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                {resellerBilling.collectionRate}% Collected
              </Badge>
              <span className="text-xs text-slate-400">
                ({resellerBilling.paidBills} paid)
              </span>
            </div>
          </Card>

          {/* Reseller Pending */}
          <Card className="p-5 rounded-2xl border border-rose-100 border-t-4 border-t-rose-500 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Pending Bills Amount
              </span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-rose-700 font-mono tracking-tight">
              ৳{resellerBilling.totalPending.toLocaleString()}
            </h3>
            <p className="text-xs text-rose-600/90 font-medium mt-1">
              <strong className="text-rose-800">{resellerBilling.unpaidBills}</strong> unpaid partner bills
            </p>
          </Card>

          {/* Reseller Count & Clients */}
          <Card className="p-5 rounded-2xl border border-purple-100 border-t-4 border-t-purple-600 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Resellers
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Network className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-purple-900 font-mono tracking-tight">
              {resellerBilling.activeResellers.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-slate-400">
                ({resellerBilling.totalResellers} total)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Serving <strong className="text-emerald-700">{resellerBilling.activeClients}</strong> active /{" "}
              <strong className="text-slate-600">{resellerBilling.inactiveClients}</strong> inactive clients
            </p>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: FINANCIAL ANALYTICS & CHARTS
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
            Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Comparative performance trends and category distribution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 6-Month Income vs Expense Bar Chart */}
          <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 border-t-4 border-t-purple-600 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Income vs Expenses Comparison
                </h2>
                <p className="text-xs text-slate-500">6-Month historical financial trend</p>
              </div>
            </div>

            <div className="h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.charts.monthly}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    width={45}
                    tickFormatter={(val) =>
                      val >= 1000 ? `৳${val / 1000}k` : `৳${val}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "15px", fontSize: "12px" }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Expense Category Pie Chart */}
          <Card className="rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-600 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-600" /> Expense Breakdown
                </h2>
                <p className="text-xs text-slate-500">By category in selected period</p>
              </div>
            </div>

            {data.charts.expenseCategories.length > 0 ? (
              <div className="h-[260px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.charts.expenseCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-slate-400 text-xs">
                No expense records found in this period
              </div>
            )}

            {/* Legend list */}
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
              {data.charts.expenseCategories.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-600 truncate font-medium">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">
                    ৳{cat.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: RECENT TRANSACTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
            Recent Transactions
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Latest income entries and expense outflows
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Income */}
          <Card className="rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-600 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Recent Income Receipts
              </h2>
              <Link
                href="/income"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {data.recent.incomes.length > 0 ? (
                data.recent.incomes.map((inc) => (
                  <div
                    key={inc._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all border border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        {inc.category}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {formatDate(inc.incomeDate)} • {inc.paymentMethod || "Cash"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 font-mono">
                        +৳{inc.amount.toLocaleString()}
                      </p>
                      {inc.reference && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          Ref: {inc.reference}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No recent income records
                </p>
              )}
            </div>
          </Card>

          {/* Recent Expenses */}
          <Card className="rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-600 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-600" /> Recent Expenses
              </h2>
              <Link
                href="/expenses"
                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {data.recent.expenses.length > 0 ? (
                data.recent.expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all border border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        {exp.category}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {formatDate(exp.expenseDate)} • {exp.paymentMethod || "Cash"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-600 font-mono">
                        -৳{exp.amount.toLocaleString()}
                      </p>
                      {exp.reference && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          Ref: {exp.reference}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No recent expense records
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
