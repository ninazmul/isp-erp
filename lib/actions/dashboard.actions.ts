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

  // ── Customer stats ──────────────────────────────────────────
  const totalCustomers = await Customer.countDocuments({ isDeleted: false });
  const activeCustomers = await Customer.countDocuments({ isDeleted: false, status: "Active" });
  const inactiveCustomers = await Customer.countDocuments({ isDeleted: false, status: "Inactive" });
  const disconnectedCustomers = await Customer.countDocuments({ isDeleted: false, status: "Disconnected" });

  // ── Current month billing ───────────────────────────────────
  const currentMonthBills = await Bill.find({ month: currentMonth, year: currentYear });
  const currentMonthCollection = currentMonthBills
    .filter((bill) => bill.status === "Paid")
    .reduce((sum, bill) => sum + bill.amount, 0);
  const currentMonthDue = currentMonthBills
    .filter((bill) => bill.status === "Unpaid")
    .reduce((sum, bill) => sum + bill.amount, 0);

  // ── Current month expenses ──────────────────────────────────
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);

  const currentMonthExpenseDocs = await Expense.find({
    expenseDate: { $gte: startOfMonth, $lte: endOfMonth },
  });
  const currentMonthExpenses = currentMonthExpenseDocs.reduce(
    (sum, e) => sum + e.amount, 0
  );

  // ── Current month manual income ─────────────────────────────
  const currentMonthIncomeDocs = await Income.find({
    incomeDate: { $gte: startOfMonth, $lte: endOfMonth },
  });
  const currentMonthManualIncome = currentMonthIncomeDocs.reduce(
    (sum, i) => sum + i.amount, 0
  );

  const currentMonthTotalIncome = currentMonthCollection + currentMonthManualIncome;
  const currentMonthProfit = currentMonthTotalIncome - currentMonthExpenses;

  // ── 6-month combined chart data ─────────────────────────────
  const monthlyChart = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const label = `${y}-${m.toString().padStart(2, "0")}`;

    const mStart = new Date(y, m - 1, 1);
    const mEnd = new Date(y, m, 0);

    // Billing income
    const bills = await Bill.find({ month: m, year: y, status: "Paid" });
    const billingIncome = bills.reduce((sum, b) => sum + b.amount, 0);

    // Manual income
    const incomes = await Income.find({ incomeDate: { $gte: mStart, $lte: mEnd } });
    const manualIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    // Expenses
    const expenses = await Expense.find({ expenseDate: { $gte: mStart, $lte: mEnd } });
    const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    monthlyChart.push({ month: label, billingIncome, manualIncome, expenses: expenseTotal });
  }

  // ── Recent activity ─────────────────────────────────────────
  const recentPayments = await Bill.find({ status: "Paid" })
    .populate("customer")
    .sort({ paymentDate: -1 })
    .limit(5);

  const recentExpenses = await Expense.find()
    .sort({ expenseDate: -1 })
    .limit(5);

  const recentIncomes = await Income.find()
    .sort({ incomeDate: -1 })
    .limit(5);

  return {
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      inactive: inactiveCustomers,
      disconnected: disconnectedCustomers,
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
