import { getExpenses } from "@/lib/actions/expense.actions";
import ExpensesClient from "./components/ExpensesClient";

export const dynamic = "force-dynamic";

interface ExpensesPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const resolvedParams = await searchParams;
  const now = new Date();

  const isAll = resolvedParams.month === "all" || resolvedParams.month === "0";
  const selectedMonth = isAll
    ? undefined
    : resolvedParams.month
    ? parseInt(resolvedParams.month, 10)
    : now.getMonth() + 1;

  const selectedYear = resolvedParams.year
    ? parseInt(resolvedParams.year, 10)
    : now.getFullYear();

  const { expenses, total, totalPages } = await getExpenses({
    month: selectedMonth,
    year: selectedYear,
    category: resolvedParams.category || "",
    search: resolvedParams.search || "",
    page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
    limit: 10,
  });

  return (
    <ExpensesClient
      initialExpenses={expenses}
      initialTotal={total}
      initialTotalPages={totalPages}
      initialMonth={isAll ? "all" : (selectedMonth || now.getMonth() + 1).toString()}
      initialYear={selectedYear.toString()}
    />
  );
}
