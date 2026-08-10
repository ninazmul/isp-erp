"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  UserPlus,
  Settings,
  Sparkles,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarSections = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
      },
      {
        title: "Billing",
        url: "/billing",
        icon: Receipt,
      },
      {
        title: "Income",
        url: "/income",
        icon: TrendingDown,
      },
      {
        title: "Expenses",
        url: "/expenses",
        icon: Wallet,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        title: "Manage Admins",
        url: "/admins",
        icon: UserPlus,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

const AdminSidebar = () => {
  const currentPath = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="text-slate-800 font-sans border-r border-purple-100/80 bg-white"
      collapsible="icon"
    >
      {/* Brand Header */}
      <SidebarHeader className="p-0">
        <div className="px-3.5 py-3.5 mb-1 flex items-center justify-between border-b border-purple-50 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
            <div className="relative p-1.5 rounded-xl bg-gradient-to-tr from-[#3e0078] to-[#6b11c9] shadow-md shadow-purple-900/10 shrink-0 group-data-[collapsible=icon]:p-1.5">
              <Image
                src="/assets/images/logo.png"
                width={100}
                height={50}
                alt="ISP ERP"
                className="brightness-0 invert object-contain h-6 w-auto group-data-[collapsible=icon]:h-5"
              />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden transition-all duration-200">
              <span className="font-extrabold text-sm tracking-tight text-[#3e0078]">
                ISP ERP
              </span>
              <span className="text-[10px] font-medium text-purple-600/70 tracking-widest uppercase flex items-center gap-1">
                Enterprise <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-1">
        {/* Sections */}
        {sidebarSections.map((section) => (
          <SidebarGroup key={section.label} className="py-1.5 group-data-[collapsible=icon]:py-1">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-purple-900/50 px-4 mb-1 group-data-[collapsible=icon]:hidden">
              {section.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2 group-data-[collapsible=icon]:px-1">
                {section.items.map((item) => {
                  const isActive =
                    item.url === "/"
                      ? currentPath === item.url
                      : currentPath === item.url ||
                      currentPath.startsWith(`${item.url}/`);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        size="lg"
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center ${isActive
                          ? "bg-gradient-to-r from-[#3e0078] to-[#5b0ea6] text-white shadow-md shadow-purple-900/20 font-semibold"
                          : "text-slate-600 hover:text-[#3e0078] hover:bg-purple-50/70"
                          }`}
                      >
                        <Link href={item.url}>
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive
                              ? "text-white scale-110"
                              : "text-purple-700/70"
                              }`}
                          />
                          <span className="group-data-[collapsible=icon]:hidden truncate">
                            {item.title}
                          </span>

                          {isActive && !isCollapsed && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-r-full shadow-sm" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
