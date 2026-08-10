import { getIncomes } from "@/lib/actions/income.actions";
import IncomesClient from "./components/IncomesClient";

export default async function IncomePage() {
  const { incomes, total, totalPages } = await getIncomes({ page: 1, limit: 10 });
  return (
    <IncomesClient
      initialIncomes={incomes}
      initialTotal={total}
      initialTotalPages={totalPages}
    />
  );
}
