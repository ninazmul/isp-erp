import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./components/AdminSidebar";
import { cookies } from "next/headers";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/actions/admin.actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) redirect("/access-denied");

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <Toaster position="top-right" />
      <main className="flex-1 h-screen mx-auto overflow-y-auto bg-slate-50/50">
        <div className="sticky top-0 z-20 flex justify-between items-center px-4 py-3 w-full border-b border-purple-950/20 text-white bg-gradient-to-r from-[#3e0078] to-[#5b0ea6] shadow-md shadow-purple-950/10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:bg-white/10 text-white transition-colors rounded-lg" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200 hidden sm:inline-block">
              SBN Solutions
            </span>
          </div>
          <SignedIn>
            <div className="">
              <UserButton afterSwitchSessionUrl="/" />
            </div>
          </SignedIn>
        </div>
        <div className="p-2 sm:p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
