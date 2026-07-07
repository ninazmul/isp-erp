"use server";

import { connectToDatabase } from "@/lib/database";
import Customer from "@/lib/database/models/customer.model";
import Bill from "@/lib/database/models/bill.model";
import Expense from "@/lib/database/models/expense.model";

export async function getDashboardData() {
  await connectToDatabase();
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Customer stats
  const totalCustomers = await Customer.countDocuments({ isDeleted: false });
  const activeCustomers = await Customer.countDocuments({ isDeleted: false, status: "Active" });
  const inactiveCustomers = await Customer.countDocuments({ isDeleted: false, status: "Inactive" });
  const disconnectedCustomers = await Customer.countDocuments({ isDeleted: false, status: "Disconnected" });
  
  // Billing stats
  const currentMonthBills = await Bill.find({ month: currentMonth, year: currentYear });
  const currentMonthCollection = currentMonthBills
    .filter((bill) => bill.status === "Paid")
    .reduce((sum, bill) => sum + bill.amount, 0);
  const currentMonthDue = currentMonthBills
    .filter((bill) => bill.status === "Unpaid")
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  // Expense stats
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  
  const currentMonthExpenses = await Expense.find({
    expenseDate: { $gte: startOfMonth, $lte: endOfMonth },
  });
  const currentMonthExpenseTotal = currentMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  
  const currentMonthProfit = currentMonthCollection - currentMonthExpenseTotal;
  
  // Monthly income chart data
  const monthlyIncome = [];
  const monthlyExpenses = [];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentYear, currentMonth - i - 1, 1);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    
    const bills = await Bill.find({ month: m, year: y, status: "Paid" });
    const income = bills.reduce((sum, bill) => sum + bill.amount, 0);
    monthlyIncome.unshift({ month: `${y}-${m.toString().padStart(2, "0")}`, amount: income });
    
    const mStart = new Date(y, m - 1, 1);
    const mEnd = new Date(y, m, 0);
    const expenses = await Expense.find({ expenseDate: { $gte: mStart, $lte: mEnd } });
    const exp = expenses.reduce((sum, e) => sum + e.amount, 0);
    monthlyExpenses.unshift({ month: `${y}-${m.toString().padStart(2, "0")}`, amount: exp });
  }
  
  // Recent payments and expenses
  const recentPayments = await Bill.find({ status: "Paid" })
    .populate("customer")
    .sort({ paymentDate: -1 })
    .limit(10);
    
  const recentExpenses = await Expense.find()
    .sort({ expenseDate: -1 })
    .limit(10);
  
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
      currentMonthExpenses: currentMonthExpenseTotal,
      currentMonthProfit,
    },
    charts: {
      monthlyIncome,
      monthlyExpenses,
    },
    recent: {
      payments: JSON.parse(JSON.stringify(recentPayments)),
      expenses: JSON.parse(JSON.stringify(recentExpenses)),
    },
  };
}
