import { getBills } from "@/lib/actions";
import BillingClient from "./components/BillingClient";

export default async function BillingPage() {
  const { bills } = await getBills();
  return <BillingClient initialBills={bills} />;
}
