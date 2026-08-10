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
} from "recharts";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Payment {
  _id: string;
  customer: { name: string };
  invoiceNumber: string;
  amount: number;
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
    };
    recent: {
      payments: Payment[];
      expenses: Expense[];
      incomes: Income[];
    };
  };
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

const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-xl shadow-xl space-y-1 text-xs">
        <p className="font-bold text-slate-700 mb-1 border-b border-slate-100 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-medium">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-800">৳{Number(entry.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardClient({ data }: DashboardClientProps) {
  const isProfit = data.billing.currentMonthProfit >= 0;

  return (
    <div className="py-4 flex flex-col gap-6 px-3 lg:px-6">
      {/* ── Banner Header ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3e0078] via-[#560aab] to-[#7c1ed4] p-6 text-white shadow-xl shadow-purple-900/10">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Executive Overview
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              SBN Solutions Dashboard
            </h1>
            <p className="text-purple-200 text-xs md:text-sm mt-1">
              Real-time analytics across billing, customer subscriptions, manual income, and operational expenses.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-purple-100 self-start md:self-auto">
            <Calendar className="w-4 h-4 text-purple-300" />
            <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* ── Customer Stats ───────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Subscriber Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Customers */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400">Total Customers</p>
                <h3 className="text-2xl font-black text-[#3e0078] mt-1">
                  {data.customers.total.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 text-[#3e0078]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3e0078]" /> Registered Accounts
            </div>
          </Card>

          {/* Active */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400">Active Connections</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {data.customers.active.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Subscriptions
            </div>
          </Card>

          {/* Inactive */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400">Inactive Subscribers</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {data.customers.inactive.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <UserMinus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-amber-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending Renewal
            </div>
          </Card>

          {/* Disconnected */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400">Disconnected</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">
                  {data.customers.disconnected.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Terminated Lines
            </div>
          </Card>
        </div>
      </section>

      {/* ── Financial Summary ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Current Month Financial Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Billing Collection */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-400">Billing Collection</span>
              <Receipt className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-emerald-600">
              ৳{data.billing.currentMonthCollection.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Paid Invoices</p>
          </Card>

          {/* Manual Income */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-400">Manual Income</span>
              <TrendingUp className="w-4 h-4 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-cyan-600">
              ৳{data.billing.currentMonthManualIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Misc Receipts</p>
          </Card>

          {/* Total Income */}
          <Card className="p-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-white shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-emerald-900">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-extrabold text-emerald-700">
              ৳{data.billing.currentMonthTotalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-emerald-600/80 font-medium mt-1">Combined Inflows</p>
          </Card>

          {/* Expenses */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-400">Expenses</span>
              <Wallet className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-rose-600">
              ৳{data.billing.currentMonthExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Operational Costs</p>
          </Card>

          {/* Due Amount */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-400">Due Receivables</span>
              <CreditCard className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-amber-600">
              ৳{data.billing.currentMonthDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Pending Collections</p>
          </Card>

          {/* Net Profit */}
          <Card className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${isProfit ? "border-purple-200 bg-gradient-to-br from-purple-50/40 to-white" : "border-rose-200 bg-rose-50/20"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-700">Net Margin</span>
              {isProfit ? <ArrowUpRight className="w-4 h-4 text-[#3e0078]" /> : <ArrowDownRight className="w-4 h-4 text-rose-600" />}
            </div>
            <h3 className={`text-lg font-black ${isProfit ? "text-[#3e0078]" : "text-rose-600"}`}>
              {isProfit ? "+" : ""}৳{data.billing.currentMonthProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-1">
              <Badge variant={isProfit ? "default" : "destructive"} className="text-[9px] py-0 px-1.5 font-bold">
                {isProfit ? "NET PROFIT" : "NET LOSS"}
              </Badge>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 6-Month Comparison Chart ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            6-Month Performance Trend
          </h2>
          <span className="text-xs font-medium text-slate-500">Billing vs Manual Income vs Expenses</span>
        </div>
        <Card className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.charts.monthly} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
              <Bar dataKey="billingIncome" name="Billing Collection" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="manualIncome" name="Manual Income" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* ── Recent Activity Feeds ─────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Live Activity Streams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Billing Collections */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Receipt className="w-4 h-4" />
                </span>
                Billing Payments
              </h3>
              <Link href="/billing" className="text-[11px] font-semibold text-purple-700 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent.payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent billing payments</p>
              ) : (
                data.recent.payments.map((payment) => (
                  <div key={payment._id} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{payment.customer?.name ?? "—"}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{payment.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-emerald-600">
                        +৳{payment.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Manual Income */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Manual Receipts
              </h3>
              <Link href="/income" className="text-[11px] font-semibold text-purple-700 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent.incomes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent manual income</p>
              ) : (
                data.recent.incomes.map((income) => (
                  <div key={income._id} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-50 text-cyan-700 mb-0.5">
                        {income.category}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {income.reference || income.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-cyan-600">
                        +৳{income.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(income.incomeDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Expenses */}
          <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
                Expenses
              </h3>
              <Link href="/expenses" className="text-[11px] font-semibold text-purple-700 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent.expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent expenses</p>
              ) : (
                data.recent.expenses.map((expense) => (
                  <div key={expense._id} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 mb-0.5">
                        {expense.category}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {expense.reference || expense.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-rose-600">
                        -৳{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(expense.expenseDate).toLocaleDateString()}
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
