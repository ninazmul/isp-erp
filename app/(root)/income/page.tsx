import { getIncomes } from "@/lib/actions/income.actions";
import IncomesClient from "./components/IncomesClient";

export default async function IncomePage() {
  const { incomes } = await getIncomes();
  return <IncomesClient initialIncomes={incomes} />;
}
