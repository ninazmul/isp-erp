"use server";

import { connectToDatabase } from "@/lib/database";
import Customer from "@/lib/database/models/customer.model";
import Bill from "@/lib/database/models/bill.model";
import Expense from "@/lib/database/models/expense.model";
import Income from "@/lib/database/models/income.model";

export async function getDashboardData() {
  await connectToDatabase();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // ── 1. Customer stats (Single aggregation facet) ──────────────────────────
  const customerStatsFacet = await Customer.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] } },
        disconnected: { $sum: { $cond: [{ $eq: ["$status", "Disconnected"] }, 1, 0] } },
      },
    },
  ]);

  const customerStats = customerStatsFacet[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    disconnected: 0,
  };

  // ── 2. Billing & Financial aggregation for current month ───────────
  const [billAggregation, expenseAggregation, incomeAggregation] = await Promise.all([
    Bill.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),
    Income.aggregate([
      { $match: { incomeDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  let currentMonthCollection = 0;
  let currentMonthDue = 0;
  billAggregation.forEach((b) => {
    if (b._id === "Paid") currentMonthCollection = b.totalAmount;
    if (b._id === "Unpaid") currentMonthDue = b.totalAmount;
  });

  const currentMonthExpenses = expenseAggregation[0]?.totalAmount || 0;
  const currentMonthManualIncome = incomeAggregation[0]?.totalAmount || 0;
  const currentMonthTotalIncome = currentMonthCollection + currentMonthManualIncome;
  const currentMonthProfit = currentMonthTotalIncome - currentMonthExpenses;

  // ── 3. 6-Month Combined Trend Aggregation (Single Aggregation per Model) ──
  const sixMonthsAgoStart = new Date(currentYear, currentMonth - 6, 1);

  const [sixMonthBills, sixMonthIncomes, sixMonthExpenses] = await Promise.all([
    Bill.aggregate([
      {
        $match: {
          status: "Paid",
          $or: Array.from({ length: 6 }, (_, i) => {
            const date = new Date(currentYear, currentMonth - 1 - i, 1);
            return { month: date.getMonth() + 1, year: date.getFullYear() };
          }),
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          amount: { $sum: "$amount" },
        },
      },
    ]),
    Income.aggregate([
      { $match: { incomeDate: { $gte: sixMonthsAgoStart, $lte: endOfMonth } } },
      {
        $group: {
          _id: {
            year: { $year: "$incomeDate" },
            month: { $month: "$incomeDate" },
          },
          amount: { $sum: "$amount" },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: sixMonthsAgoStart, $lte: endOfMonth } } },
      {
        $group: {
          _id: {
            year: { $year: "$expenseDate" },
            month: { $month: "$expenseDate" },
          },
          amount: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  // Build O(1) map for quick 6-month chart aggregation lookup
  const billMap = new Map<string, number>();
  sixMonthBills.forEach((item) => {
    const key = `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`;
    billMap.set(key, item.amount);
  });

  const incomeMap = new Map<string, number>();
  sixMonthIncomes.forEach((item) => {
    const key = `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`;
    incomeMap.set(key, item.amount);
  });

  const expenseMap = new Map<string, number>();
  sixMonthExpenses.forEach((item) => {
    const key = `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`;
    expenseMap.set(key, item.amount);
  });

  const monthlyChart = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const label = `${y}-${m.toString().padStart(2, "0")}`;

    monthlyChart.push({
      month: label,
      billingIncome: billMap.get(label) || 0,
      manualIncome: incomeMap.get(label) || 0,
      expenses: expenseMap.get(label) || 0,
    });
  }

  // ── 4. Recent Activities (Optimized with .lean() & .select()) ───────────────
  const [recentPayments, recentExpenses, recentIncomes] = await Promise.all([
    Bill.find({ status: "Paid" })
      .select("customer invoiceNumber amount paymentDate")
      .populate("customer", "name")
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean(),
    Expense.find()
      .select("category amount expenseDate paymentMethod reference")
      .sort({ expenseDate: -1 })
      .limit(5)
      .lean(),
    Income.find()
      .select("category amount incomeDate paymentMethod reference")
      .sort({ incomeDate: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    customers: {
      total: customerStats.total,
      active: customerStats.active,
      inactive: customerStats.inactive,
      disconnected: customerStats.disconnected,
    },
    billing: {
      currentMonthCollection,
      currentMonthDue,
      currentMonthManualIncome,
      currentMonthTotalIncome,
      currentMonthExpenses,
      currentMonthProfit,
    },
    charts: {
      monthly: monthlyChart,
    },
    recent: {
      payments: JSON.parse(JSON.stringify(recentPayments)),
      expenses: JSON.parse(JSON.stringify(recentExpenses)),
      incomes: JSON.parse(JSON.stringify(recentIncomes)),
    },
  };
}
