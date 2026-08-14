import { getCustomers } from "@/lib/actions/customer.actions";
import CustomersClient from "./components/CustomersClient";

export const dynamic = "force-dynamic";

interface CustomersPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedParams = await searchParams;
  const now = new Date();

  const isAll = resolvedParams.month === "all" || resolvedParams.month === "0";
  const selectedMonth = isAll
    ? undefined
    : resolvedParams.month
    ? parseInt(resolvedParams.month, 10)
    : undefined;

  const selectedYear = resolvedParams.year
    ? parseInt(resolvedParams.year, 10)
    : undefined;

  const { customers, total, totalPages } = await getCustomers({
    month: selectedMonth,
    year: selectedYear,
    status: resolvedParams.status || "",
    search: resolvedParams.search || "",
    page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
    limit: 10,
  });

  return (
    <CustomersClient
      initialCustomers={customers}
      initialTotal={total}
      initialTotalPages={totalPages}
      initialMonth={isAll ? "all" : selectedMonth ? selectedMonth.toString() : "all"}
      initialYear={selectedYear ? selectedYear.toString() : now.getFullYear().toString()}
    />
  );
}
