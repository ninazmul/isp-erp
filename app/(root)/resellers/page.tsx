import { getResellers } from "@/lib/actions/reseller.actions";
import ResellersClient from "./components/ResellersClient";

export const dynamic = "force-dynamic";

export default async function ResellersPage() {
  const data = await getResellers({ page: 1, limit: 10 });

  return (
    <ResellersClient
      initialResellers={data.resellers}
      initialTotal={data.total}
      initialTotalPages={data.totalPages}
    />
  );
}
