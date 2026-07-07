"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBills, getExpenses } from "@/lib/actions";
import { Download } from "lucide-react";

// Define types
interface Bill {
  _id: string;
  invoiceNumber: string;
  customer: { name: string };
  amount: number;
  status: string;
  paymentDate?: Date;
}

interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
}

export default function ReportsPage() {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadData = useCallback(async () => {
    const [billsRes, expensesRes] = await Promise.all([
      getBills({ month: parseInt(month), year: parseInt(year) }),
      getExpenses({ month: parseInt(month), year: parseInt(year) }),
    ]);
    setBills(billsRes.bills);
    setExpenses(expensesRes.expenses);
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalIncome = bills
    .filter((b) => b.status === "Paid")
    .reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalIncome - totalExpenses;
  const totalDue = bills
    .filter((b) => b.status === "Unpaid")
    .reduce((sum, b) => sum + b.amount, 0);

  const exportToCSV = <T extends object>(data: T[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => JSON.stringify(row[header as keyof T] as unknown))
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex gap-4">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(0, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i,
              ).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            ৳{totalIncome.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ৳{totalExpenses.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Profit</p>
          <p className="text-2xl font-bold text-[#3e0078]">
            ৳{totalProfit.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Due</p>
          <p className="text-2xl font-bold text-yellow-600">
            ৳{totalDue.toFixed(2)}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Income Report</TabsTrigger>
          <TabsTrigger value="expenses">Expense Report</TabsTrigger>
          <TabsTrigger value="profit">Profit Report</TabsTrigger>
          <TabsTrigger value="due">Due Report</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Income Report -{" "}
                {new Date(0, parseInt(month) - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </h3>
              <Button
                variant="outline"
                onClick={() =>
                  exportToCSV(
                    bills.filter((b) => b.status === "Paid"),
                    `income-report-${month}-${year}.csv`,
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills
                  .filter((b) => b.status === "Paid")
                  .map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell>{bill.invoiceNumber}</TableCell>
                      <TableCell>{bill.customer.name}</TableCell>
                      <TableCell>৳{bill.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {bill.paymentDate
                          ? new Date(bill.paymentDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Expense Report -{" "}
                {new Date(0, parseInt(month) - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </h3>
              <Button
                variant="outline"
                onClick={() =>
                  exportToCSV(expenses, `expense-report-${month}-${year}.csv`)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>৳{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="profit">
          <Card>
            <div className="p-4">
              <h3 className="text-xl font-semibold">
                Profit Report -{" "}
                {new Date(0, parseInt(month) - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Income</TableCell>
                    <TableCell className="text-green-600 font-bold">
                      ৳{totalIncome.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Expenses</TableCell>
                    <TableCell className="text-red-600 font-bold">
                      ৳{totalExpenses.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Net Profit</TableCell>
                    <TableCell className="text-[#3e0078]">
                      ৳{totalProfit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="due">
          <Card>
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Due Report -{" "}
                {new Date(0, parseInt(month) - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </h3>
              <Button
                variant="outline"
                onClick={() =>
                  exportToCSV(
                    bills.filter((b) => b.status === "Unpaid"),
                    `due-report-${month}-${year}.csv`,
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills
                  .filter((b) => b.status === "Unpaid")
                  .map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell>{bill.invoiceNumber}</TableCell>
                      <TableCell>{bill.customer.name}</TableCell>
                      <TableCell>৳{bill.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
