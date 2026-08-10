import { getBills } from "@/lib/actions";
import BillingClient from "./components/BillingClient";

export default async function BillingPage() {
  const { bills, total, totalPages } = await getBills({ page: 1, limit: 10 });
  return (
    <BillingClient
      initialBills={bills}
      initialTotal={total}
      initialTotalPages={totalPages}
    />
  );
}
