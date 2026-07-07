import { auth } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import DashboardClient from "./components/DashboardClient";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const dashboardData = await getDashboardData();

  return <DashboardClient data={dashboardData} />;
};

export default DashboardPage;
