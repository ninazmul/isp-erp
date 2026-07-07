import { getBills, getSettings } from "@/lib/actions";
import BillingClient from "./components/BillingClient";

export default async function BillingPage() {
  const { bills } = await getBills();
  const settings = await getSettings();
  return <BillingClient initialBills={bills} settings={settings} />;
}
