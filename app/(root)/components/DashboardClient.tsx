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

export default function DashboardClient({ data }: DashboardClientProps) {
  const isProfit = data.billing.currentMonthProfit >= 0;

  return (
    <div className="py-6 flex flex-col gap-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight">📊 ISP ERP Dashboard</h1>

      {/* ── Customer stats ───────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Customer Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-500">Total</p>
            <h2 className="text-3xl font-bold text-[#3e0078]">{data.customers.total}</h2>
          </Card>
          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-500">Active</p>
            <h2 className="text-3xl font-bold text-green-600">{data.customers.active}</h2>
          </Card>
          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-500">Inactive</p>
            <h2 className="text-3xl font-bold text-yellow-600">{data.customers.inactive}</h2>
          </Card>
          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-500">Disconnected</p>
            <h2 className="text-3xl font-bold text-red-500">{data.customers.disconnected}</h2>
          </Card>
        </div>
      </section>

      {/* ── Financial summary ────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          This Month — Financial Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-500">Billing Collection</p>
            <h2 className="text-xl font-bold text-green-600">
              ৳{data.billing.currentMonthCollection.toFixed(2)}
            </h2>
          </Card>

          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-500">Manual Income</p>
            <h2 className="text-xl font-bold text-emerald-600">
              ৳{data.billing.currentMonthManualIncome.toFixed(2)}
            </h2>
          </Card>

          <Card className="p-5 shadow-sm hover:shadow-md transition border-2 border-green-200">
            <p className="text-xs text-gray-500">Total Income</p>
            <h2 className="text-xl font-bold text-green-700">
              ৳{data.billing.currentMonthTotalIncome.toFixed(2)}
            </h2>
          </Card>

          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-500">Expenses</p>
            <h2 className="text-xl font-bold text-red-500">
              ৳{data.billing.currentMonthExpenses.toFixed(2)}
            </h2>
          </Card>

          <Card className="p-5 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-500">Due Amount</p>
            <h2 className="text-xl font-bold text-orange-500">
              ৳{data.billing.currentMonthDue.toFixed(2)}
            </h2>
          </Card>

          <Card className={`p-5 shadow-sm hover:shadow-md transition border-2 ${isProfit ? "border-[#3e0078]/30" : "border-red-200"}`}>
            <p className="text-xs text-gray-500">Net Profit</p>
            <h2 className={`text-xl font-bold ${isProfit ? "text-[#3e0078]" : "text-red-600"}`}>
              {isProfit ? "+" : ""}৳{data.billing.currentMonthProfit.toFixed(2)}
            </h2>
          </Card>
        </div>
      </section>

      {/* ── 6-month combined chart ────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          6-Month Overview
        </h2>
        <Card className="p-5 shadow-sm">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data.charts.monthly}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `৳${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="billingIncome" name="Billing Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="manualIncome" name="Manual Income" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* ── Recent activity ──────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <Card className="p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              💳 Recent Payments
            </h3>
            <div className="space-y-3">
              {data.recent.payments.length === 0 ? (
                <p className="text-sm text-gray-400">No recent payments</p>
              ) : (
                data.recent.payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex justify-between items-center border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{payment.customer?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{payment.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">
                        ৳{payment.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Manual Income */}
          <Card className="p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              📥 Recent Income
            </h3>
            <div className="space-y-3">
              {data.recent.incomes.length === 0 ? (
                <p className="text-sm text-gray-400">No recent income entries</p>
              ) : (
                data.recent.incomes.map((income) => (
                  <div
                    key={income._id}
                    className="flex justify-between items-center border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{income.category}</p>
                      <p className="text-xs text-gray-400">
                        {income.reference || income.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">
                        ৳{income.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(income.incomeDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Expenses */}
          <Card className="p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              📤 Recent Expenses
            </h3>
            <div className="space-y-3">
              {data.recent.expenses.length === 0 ? (
                <p className="text-sm text-gray-400">No recent expenses</p>
              ) : (
                data.recent.expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex justify-between items-center border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{expense.category}</p>
                      <p className="text-xs text-gray-400">
                        {expense.reference || expense.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500 text-sm">
                        ৳{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
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
