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

type DashboardClientProps = {
  data: {
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netProfit: number;
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
    ? "All Time Overview"
    : `${currentMonthName} ${currentYearDisplay}`;

  const { totalIncome, totalExpenses, netProfit } = data.summary;
  const isProfitable = netProfit >= 0;

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income */}
        <Card className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700/80">
              Total Income
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ৳{totalIncome.toLocaleString()}
            </h3>
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total cash inflows in period
            </p>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/20 to-pink-50/30 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700/80">
              Total Expenses
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ৳{totalExpenses.toLocaleString()}
            </h3>
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Total cash outflows in period
            </p>
          </div>
        </Card>

        {/* Net Profit / Loss */}
        <Card
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all ${isProfitable
              ? "border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30"
              : "border-rose-200 bg-gradient-to-br from-white via-rose-50/40 to-rose-100/30"
            }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${isProfitable ? "text-emerald-800" : "text-rose-800"
                }`}
            >
              Net {isProfitable ? "Profit" : "Loss"}
            </span>
            <div
              className={`p-2.5 rounded-xl ${isProfitable
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-500/10 text-rose-600"
                }`}
            >
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              ৳{Math.abs(netProfit).toLocaleString()}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  isProfitable
                    ? "bg-emerald-600 text-white font-bold text-[10px]"
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
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Income vs Expense Bar Chart */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
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
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
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
                  tickFormatter={(val) => `৳${val}`}
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
        <Card className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
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

      {/* Recent Streams Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Income */}
        <Card className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
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
        <Card className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
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
  );
}
