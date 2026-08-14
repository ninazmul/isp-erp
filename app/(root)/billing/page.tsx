import { getBills } from "@/lib/actions/bill.actions";
import BillingClient from "./components/BillingClient";

export const dynamic = "force-dynamic";

interface BillingPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
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

  const { bills, total, totalPages } = await getBills({
    month: selectedMonth,
    year: selectedYear,
    search: resolvedParams.search || "",
    status: resolvedParams.status || "",
    page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
    limit: 10,
  });

  return (
    <BillingClient
      initialBills={bills}
      initialTotal={total}
      initialTotalPages={totalPages}
      initialMonth={isAll ? "all" : (selectedMonth || now.getMonth() + 1).toString()}
      initialYear={selectedYear.toString()}
    />
  );
}
