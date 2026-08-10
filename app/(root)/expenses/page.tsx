import { getExpenses } from "@/lib/actions/expense.actions";
import ExpensesClient from "./components/ExpensesClient";

export default async function ExpensesPage() {
  const { expenses, total, totalPages } = await getExpenses({ page: 1, limit: 10 });
  return (
    <ExpensesClient
      initialExpenses={expenses}
      initialTotal={total}
      initialTotalPages={totalPages}
    />
  );
}
