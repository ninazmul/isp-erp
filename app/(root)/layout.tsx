import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./components/AdminSidebar";
import { cookies } from "next/headers";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/actions/admin.actions";
import { Calendar } from "lucide-react";

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
      <main className="flex-1 min-h-dvh mx-auto overflow-y-auto bg-slate-50/80">
        <div className="sticky top-0 z-20 flex justify-between items-center px-4 py-3 w-full border-b border-purple-950/20 text-white bg-gradient-to-r from-[#3e0078] to-[#5b0ea6] shadow-md shadow-purple-950/10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:bg-white/10 text-white transition-colors rounded-lg" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200 hidden sm:inline-block">
              SBN Enterprise
            </span>
          </div>
          <SignedIn>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-white shadow-sm self-start md:self-auto">
                <Calendar className="w-4 h-4 text-purple-300" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <UserButton afterSwitchSessionUrl="/" />
            </div>
          </SignedIn>
        </div>
        <div className="w-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
