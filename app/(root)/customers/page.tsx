import { getCustomers } from "@/lib/actions/customer.actions";
import { getPackages } from "@/lib/actions/package.actions";
import { getLocations } from "@/lib/actions/location.actions";
import CustomersClient from "./components/CustomersClient";

export const dynamic = "force-dynamic";

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    packageName?: string;
    location?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedParams = await searchParams;

  const [customerData, packages, locations] = await Promise.all([
    getCustomers({
      search: resolvedParams.search || "",
      status: resolvedParams.status || "",
      packageName: resolvedParams.packageName || "",
      location: resolvedParams.location || "",
      page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
      limit: 10,
    }),
    getPackages(),
    getLocations(),
  ]);

  return (
    <CustomersClient
      initialCustomers={customerData.customers}
      initialTotal={customerData.total}
      initialTotalPages={customerData.totalPages}
      initialPackages={packages}
      initialLocations={locations}
    />
  );
}
