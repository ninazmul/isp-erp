import { getCustomers } from "@/lib/actions/customer.actions";
import CustomersClient from "./components/CustomersClient";

export default async function CustomersPage() {
  const { customers } = await getCustomers();

  return <CustomersClient initialCustomers={customers} />;
}
