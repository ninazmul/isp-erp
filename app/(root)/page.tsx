import { auth } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import DashboardClient from "./components/DashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const resolvedParams = await searchParams;
  const month =
    resolvedParams.month !== undefined && resolvedParams.month !== ""
      ? parseInt(resolvedParams.month, 10)
      : undefined;
  const year =
    resolvedParams.year !== undefined && resolvedParams.year !== ""
      ? parseInt(resolvedParams.year, 10)
      : undefined;

  const dashboardData = await getDashboardData(month, year);

  return (
    <DashboardClient
      data={dashboardData}
      selectedMonth={month}
      selectedYear={year}
    />
  );
};

export default DashboardPage;
