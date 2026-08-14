import { getIncomes } from "@/lib/actions/income.actions";
import IncomesClient from "./components/IncomesClient";

export const dynamic = "force-dynamic";

interface IncomePageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
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

  const { incomes, total, totalPages } = await getIncomes({
    month: selectedMonth,
    year: selectedYear,
    category: resolvedParams.category || "",
    search: resolvedParams.search || "",
    page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
    limit: 10,
  });

  return (
    <IncomesClient
      initialIncomes={incomes}
      initialTotal={total}
      initialTotalPages={totalPages}
      initialMonth={isAll ? "all" : (selectedMonth || now.getMonth() + 1).toString()}
      initialYear={selectedYear.toString()}
    />
  );
}
