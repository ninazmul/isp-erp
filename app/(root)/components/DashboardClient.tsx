"use client";

import { Card } from "@/components/ui/card";
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
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
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
      currentMonthExpenses: number;
      currentMonthProfit: number;
    };
    charts: {
      monthlyIncome: { month: string; amount: number }[];
      monthlyExpenses: { month: string; amount: number }[];
    };
    recent: {
      payments: Payment[];
      expenses: Expense[];
    };
  };
};

export default function DashboardClient({ data }: DashboardClientProps) {
  const COLOR_PALETTE = [
    "#3e0078",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <div className="py-6 flex flex-col gap-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight">
        📊 ISP ERP Dashboard
      </h1>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6">
        <Card className="p-5 shadow-sm hover:shadow-md transition col-span-1 md:col-span-2">
          <p className="text-sm text-gray-500">Total Customers</p>
          <h2 className="text-3xl font-bold text-[#3e0078]">
            {data.customers.total}
          </h2>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition col-span-1 md:col-span-2">
          <p className="text-sm text-gray-500">Active Customers</p>
          <h2 className="text-3xl font-bold text-green-600">
            {data.customers.active}
          </h2>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition col-span-1 md:col-span-2">
          <p className="text-sm text-gray-500">Inactive Customers</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {data.customers.inactive}
          </h2>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition col-span-1 md:col-span-2">
          <p className="text-sm text-gray-500">Disconnected Customers</p>
          <h2 className="text-3xl font-bold text-red-600">
            {data.customers.disconnected}
          </h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Current Month Collection</p>
          <h2 className="text-2xl font-bold text-green-600">
            ৳{data.billing.currentMonthCollection.toFixed(2)}
          </h2>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Current Month Due</p>
          <h2 className="text-2xl font-bold text-yellow-600">
            ৳{data.billing.currentMonthDue.toFixed(2)}
          </h2>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Current Month Expenses</p>
          <h2 className="text-2xl font-bold text-orange-600">
            ৳{data.billing.currentMonthExpenses.toFixed(2)}
          </h2>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Current Month Profit</p>
          <h2 className="text-2xl font-bold text-[#3e0078]">
            ৳{data.billing.currentMonthProfit.toFixed(2)}
          </h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Income Chart */}
        <Card className="p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Monthly Income</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.charts.monthlyIncome}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `৳${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="amount" fill={COLOR_PALETTE[0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Expenses Chart */}
        <Card className="p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.charts.monthlyExpenses}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `৳${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="amount" fill={COLOR_PALETTE[3]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-4">
            {data.recent.payments.length === 0 ? (
              <p className="text-gray-500">No recent payments</p>
            ) : (
              data.recent.payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{payment.customer.name}</p>
                    <p className="text-sm text-gray-500">
                      {payment.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ৳{payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Expenses */}
        <Card className="p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
          <div className="space-y-4">
            {data.recent.expenses.length === 0 ? (
              <p className="text-gray-500">No recent expenses</p>
            ) : (
              data.recent.expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{expense.title}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      ৳{expense.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
