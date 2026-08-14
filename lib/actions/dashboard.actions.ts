"use server";

import { connectToDatabase } from "@/lib/database";
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
  const expenseMatch = isAllTime
    ? {}
    : { expenseDate: { $gte: startOfMonth, $lte: endOfMonth } };
  const incomeMatch = isAllTime
    ? {}
    : { incomeDate: { $gte: startOfMonth, $lte: endOfMonth } };

  // ── Execute ALL aggregations and queries in parallel ──────────
  const [
    expenseAggregation,
    incomeAggregation,
    expenseCategoryAggregation,
    incomeCategoryAggregation,
    sixMonthIncomes,
    sixMonthExpenses,
    recentExpenses,
    recentIncomes,
  ] = await Promise.all([
    // 1. Expenses total
    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),

    // 2. Income total
    Income.aggregate([
      { $match: incomeMatch },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),

    // 3. Expense Category breakdown
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

    // 4. Income Category breakdown
    Income.aggregate([
      { $match: incomeMatch },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // 5. 6-Month Incomes
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

    // 6. 6-Month Expenses
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

    // 7. Recent Expenses stream
    Expense.find(isAllTime ? {} : { expenseDate: { $gte: startOfMonth, $lte: endOfMonth } })
      .select("category amount expenseDate paymentMethod reference description")
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),

    // 8. Recent Incomes stream
    Income.find(isAllTime ? {} : { incomeDate: { $gte: startOfMonth, $lte: endOfMonth } })
      .select("category amount incomeDate paymentMethod reference description")
      .sort({ incomeDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const totalExpenses = expenseAggregation[0]?.totalAmount || 0;
  const totalIncome = incomeAggregation[0]?.totalAmount || 0;
  const netProfit = totalIncome - totalExpenses;

  // Build maps for quick 6-month chart lookup
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
      income: incomeMap.get(label) || 0,
      expenses: expenseMap.get(label) || 0,
    });
  }

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netProfit,
    },
    charts: {
      monthly: monthlyChart,
      expenseCategories: expenseCategoryAggregation.map((item) => ({
        name: item._id || "Uncategorized",
        value: item.total || 0,
      })),
      incomeCategories: incomeCategoryAggregation.map((item) => ({
        name: item._id || "Uncategorized",
        value: item.total || 0,
      })),
    },
    recent: {
      expenses: JSON.parse(JSON.stringify(recentExpenses)),
      incomes: JSON.parse(JSON.stringify(recentIncomes)),
    },
    isAllTime,
  };
}
