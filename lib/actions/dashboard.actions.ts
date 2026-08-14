"use server";

import { connectToDatabase } from "@/lib/database";
import Customer from "@/lib/database/models/customer.model";
import Bill from "@/lib/database/models/bill.model";
import Expense from "@/lib/database/models/expense.model";
import Income from "@/lib/database/models/income.model";

export async function getDashboardData(selectedMonth?: number, selectedYear?: number) {
  await connectToDatabase();

  const now = new Date();
  const isAllTime = selectedMonth === 0;

  const currentMonth =
    !isAllTime && selectedMonth && selectedMonth >= 1 && selectedMonth <= 12
      ? selectedMonth
      : now.getMonth() + 1;

  const currentYear =
    !isAllTime && selectedYear && selectedYear >= 2000 && selectedYear <= 2100
      ? selectedYear
      : now.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  const sixMonthsAgoStart = new Date(currentYear, currentMonth - 6, 1, 0, 0, 0, 0);

  // Match objects based on date filter mode
  const billMatch = isAllTime ? {} : { month: currentMonth, year: currentYear };
  const expenseMatch = isAllTime
    ? {}
    : { expenseDate: { $gte: startOfMonth, $lte: endOfMonth } };
  const incomeMatch = isAllTime
    ? {}
    : { incomeDate: { $gte: startOfMonth, $lte: endOfMonth } };

  // ── Execute ALL aggregations and queries in 1 parallel Promise.all ──────────
  const [
    customerStatsFacet,
    billAggregation,
    expenseAggregation,
    incomeAggregation,
    expenseCategoryAggregation,
    sixMonthBills,
    sixMonthIncomes,
    sixMonthExpenses,
    recentPayments,
    recentExpenses,
    recentIncomes,
  ] = await Promise.all([
    // 1. Customer stats
    Customer.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] } },
          disconnected: {
            $sum: { $cond: [{ $eq: ["$status", "Disconnected"] }, 1, 0] },
          },
        },
      },
    ]),

    // 2. Billing & collection breakdown
    Bill.aggregate([
      { $match: billMatch },
      {
        $group: {
          _id: null,
          collectedAmount: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$paidAmount", 0] }, 0] },
                "$paidAmount",
                { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] },
              ],
            },
          },
          dueAmount: {
            $sum: {
              $cond: [
                { $ne: [{ $type: "$dueAmount" }, "missing"] },
                "$dueAmount",
                { $cond: [{ $eq: ["$status", "Unpaid"] }, "$amount", 0] },
              ],
            },
          },
          advanceAmount: { $sum: { $ifNull: ["$advanceAmount", 0] } },
        },
      },
    ]),

    // 3. Expenses total
    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),

    // 4. Income total
    Income.aggregate([
      { $match: incomeMatch },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),

    // 5. Expense Category breakdown
    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // 6. 6-Month Bills
    Bill.aggregate([
      {
        $match: {
          $or: Array.from({ length: 6 }, (_, i) => {
            const date = new Date(currentYear, currentMonth - 1 - i, 1);
            return { month: date.getMonth() + 1, year: date.getFullYear() };
          }),
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          amount: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$paidAmount", 0] }, 0] },
                "$paidAmount",
                { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] },
              ],
            },
          },
        },
      },
    ]),

    // 7. 6-Month Incomes
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

    // 8. 6-Month Expenses
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

    // 9. Recent Payments stream
    Bill.find(
      isAllTime
        ? { $or: [{ status: "Paid" }, { paidAmount: { $gt: 0 } }] }
        : {
            month: currentMonth,
            year: currentYear,
            $or: [{ status: "Paid" }, { paidAmount: { $gt: 0 } }],
          }
    )
      .select("customer invoiceNumber amount paidAmount dueAmount advanceAmount paymentDate")
      .populate("customer", "name")
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),

    // 10. Recent Expenses stream
    Expense.find(isAllTime ? {} : { expenseDate: { $gte: startOfMonth, $lte: endOfMonth } })
      .select("category amount expenseDate paymentMethod reference")
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),

    // 11. Recent Incomes stream
    Income.find(isAllTime ? {} : { incomeDate: { $gte: startOfMonth, $lte: endOfMonth } })
      .select("category amount incomeDate paymentMethod reference")
      .sort({ incomeDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Extract customer stats
  const customerStats = customerStatsFacet[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    disconnected: 0,
  };

  const currentMonthCollection = billAggregation[0]?.collectedAmount || 0;
  const currentMonthDue = billAggregation[0]?.dueAmount || 0;
  const currentMonthAdvance = billAggregation[0]?.advanceAmount || 0;
  const currentMonthExpenses = expenseAggregation[0]?.totalAmount || 0;
  const currentMonthManualIncome = incomeAggregation[0]?.totalAmount || 0;
  const currentMonthTotalIncome = currentMonthCollection + currentMonthManualIncome;
  const currentMonthProfit = currentMonthTotalIncome - currentMonthExpenses;

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
      currentMonthAdvance,
      currentMonthManualIncome,
      currentMonthTotalIncome,
      currentMonthExpenses,
      currentMonthProfit,
    },
    charts: {
      monthly: monthlyChart,
      expenseCategories: expenseCategoryAggregation.map((item) => ({
        name: item._id || "Uncategorized",
        value: item.total || 0,
      })),
    },
    recent: {
      payments: JSON.parse(JSON.stringify(recentPayments)),
      expenses: JSON.parse(JSON.stringify(recentExpenses)),
      incomes: JSON.parse(JSON.stringify(recentIncomes)),
    },
    isAllTime,
  };
}
