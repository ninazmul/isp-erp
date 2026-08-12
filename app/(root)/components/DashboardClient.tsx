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
  Receipt
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

export default function DashboardClient({ data }: DashboardClientProps) {
  const isProfit = data.billing.currentMonthProfit >= 0;
  const getPaymentAmount = (payment: Payment) =>
    payment.paidAmount ?? payment.amount;

  return (
    <div className="py-4 flex flex-col gap-6 px-3 lg:px-6">
      {/* ── Customer Stats ───────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Subscriber Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Customers */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-purple-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-50/40 via-white to-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Total Customers
                </p>
                <h3 className="text-2xl font-black text-[#3e0078] mt-1">
                  {data.customers.total.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-100/80 text-[#3e0078] shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-purple-900 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3e0078]" /> Registered
              Accounts
            </div>
          </Card>

          {/* Active */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50/40 via-white to-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Active Connections
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {data.customers.active.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-700 shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
              Subscriptions
            </div>
          </Card>

          {/* Inactive */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-amber-50/40 via-white to-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Inactive Subscribers
                </p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {data.customers.inactive.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-700 shadow-2xs">
                <UserMinus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-amber-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              Renewal
            </div>
          </Card>

          {/* Disconnected */}
          <Card className="p-4 rounded-2xl border border-slate-100 border-t-4 border-t-rose-500 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-rose-50/40 via-white to-white relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Disconnected
                </p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">
                  {data.customers.disconnected.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-100/80 text-rose-700 shadow-2xs">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-rose-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Terminated
              Lines
            </div>
          </Card>
        </div>
      </section>

      {/* ── Financial Summary ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Current Month Financial Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* Billing Collection */}
          <Card className="p-4 rounded-2xl border border-emerald-200/70 border-t-4 border-t-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50/50 via-white to-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-emerald-900">
                Billing Collection
              </span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-emerald-700">
              ৳
              {data.billing.currentMonthCollection.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[10px] text-emerald-700/80 font-bold mt-1">Paid Invoices</p>
          </Card>

          {/* Manual Income */}
          <Card className="p-4 rounded-2xl border border-cyan-200/70 border-t-4 border-t-cyan-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-cyan-50/50 via-white to-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-cyan-900">
                Manual Income
              </span>
              <TrendingUp className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="text-lg font-black text-cyan-700">
              ৳
              {data.billing.currentMonthManualIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[10px] text-cyan-700/80 font-bold mt-1">Misc Receipts</p>
          </Card>

          {/* Total Income */}
          <Card className="p-4 rounded-2xl border border-emerald-300 border-t-4 border-t-emerald-700 bg-gradient-to-br from-emerald-100/60 via-emerald-50/30 to-white shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-emerald-950">
                Total Revenue
              </span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-lg font-black text-emerald-800">
              ৳
              {data.billing.currentMonthTotalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[10px] text-emerald-800/90 font-extrabold mt-1">
              Combined Inflows
            </p>
          </Card>

          {/* Expenses */}
          <Card className="p-4 rounded-2xl border border-rose-200/70 border-t-4 border-t-rose-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-rose-50/50 via-white to-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-rose-900">
                Expenses
              </span>
              <Wallet className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-rose-700">
              ৳
              {data.billing.currentMonthExpenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[10px] text-rose-700/80 font-bold mt-1">Operational Costs</p>
          </Card>

          {/* Due Amount */}
          <Card className="p-4 rounded-2xl border border-amber-200/70 border-t-4 border-t-amber-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-amber-50/50 via-white to-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-amber-900">
                Due Receivables
              </span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-amber-700">
              ৳
              {data.billing.currentMonthDue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[10px] text-amber-700/80 font-bold mt-1">
              Pending Collections
            </p>
          </Card>

          {/* Advance Amount */}
          <Card className="p-4 rounded-2xl border border-cyan-200/70 border-t-4 border-t-cyan-600 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-cyan-50/50 via-white to-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-cyan-900">
                Advance
              </span>
              <CreditCard className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="text-lg font-black text-cyan-700">
              ৳
              {data.billing.currentMonthAdvance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[10px] text-cyan-700/80 font-bold mt-1">
              Extra Collections
            </p>
          </Card>

          {/* Net Profit */}
          <Card
            className={`p-4 rounded-2xl border border-t-4 shadow-md hover:shadow-lg transition-all duration-200 ${isProfit
                ? "border-purple-300 border-t-purple-700 bg-gradient-to-br from-purple-100/60 via-purple-50/30 to-white"
                : "border-rose-300 border-t-rose-700 bg-gradient-to-br from-rose-100/60 via-rose-50/30 to-white"
              }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-900">
                Net Margin
              </span>
              {isProfit ? (
                <ArrowUpRight className="w-4 h-4 text-[#3e0078]" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
              )}
            </div>
            <h3
              className={`text-lg font-black ${isProfit ? "text-[#3e0078]" : "text-rose-700"}`}
            >
              {isProfit ? "+" : ""}৳
              {data.billing.currentMonthProfit.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <div className="mt-1">
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
          </Card>
        </div>
      </section>

      {/* ── 6-Month Comparison Chart ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            6-Month Performance Trend
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Billing vs Manual Income vs Expenses
          </span>
        </div>
        <Card className="p-5 rounded-2xl border border-slate-100 border-t-4 border-t-purple-600 shadow-sm bg-white">
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
