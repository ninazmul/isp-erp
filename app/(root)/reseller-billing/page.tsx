import { getResellerBills } from "@/lib/actions/reseller-bill.actions";
import ResellerBillingClient from "./components/ResellerBillingClient";

export const dynamic = "force-dynamic";

export default async function ResellerBillingPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const data = await getResellerBills({
    month: currentMonth,
    year: currentYear,
    page: 1,
    limit: 10,
  });

  return (
    <ResellerBillingClient
      initialBills={data.bills}
      initialTotal={data.total}
      initialTotalPages={data.totalPages}
    />
  );
}
