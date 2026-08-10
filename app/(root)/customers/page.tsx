import { getCustomers } from "@/lib/actions/customer.actions";
import CustomersClient from "./components/CustomersClient";

export default async function CustomersPage() {
  const { customers, total, totalPages } = await getCustomers({ page: 1, limit: 10 });

  return (
    <CustomersClient
      initialCustomers={customers}
      initialTotal={total}
      initialTotalPages={totalPages}
    />
  );
}
