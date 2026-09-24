"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Box,
  MonitorSmartphone,
  Wrench,
  ArrowRightLeft,
  Settings,
  Menu,
  X,
  Database,
  BarChart3,
  ClipboardCheck,
  Scale,
  LogOut,
  User,
  Bell,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
const sidebarNav = [
  {
    title: "ภาพรวม (Dashboard)",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "บริหารจัดการทรัพย์สิน",
    items: [
      {
        title: "ทะเบียนทรัพย์สินทั้งหมด",
        href: "/dashboard/assets",
        icon: Package,
      },
      {
        title: "การซ่อมบำรุง",
        href: "/dashboard/maintenance",
        icon: Wrench,
      },
      {
        title: "ประวัติการโอนย้าย",
        href: "/dashboard/transfers",
        icon: ArrowRightLeft,
      },
      {
        title: "การตรวจนับ (Audit)",
        href: "/dashboard/audits",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "ตั้งค่าข้อมูลพื้นฐาน",
    icon: Database,
    items: [
      { title: "หมวดหมู่ (Categories)", href: "/dashboard/master/categories" },
      { title: "แผนก (Departments)", href: "/dashboard/master/departments" },
      { title: "พนักงาน (Employees)", href: "/dashboard/master/employees" },
      { title: "สถานที่ (Locations)", href: "/dashboard/master/locations" },
    ],
  }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="relative h-8 w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ATS Logo" className="object-contain h-full w-full" />
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {sidebarNav.map((item, index) => (
              <div key={index} className="pb-2">
                <Link
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname === item.href || (pathname.startsWith(item.href || "") && item.href !== "/dashboard")
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.title}
                </Link>
                {item.items && (
                  <div className="ml-4 mt-1 grid gap-1 border-l pl-2">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:text-primary text-sm",
                          pathname === subItem.href
                            ? "bg-muted text-primary font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                {/* Search could go here */}
              </div>
            </form>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </header>

        {/* Mobile menu (simple implementation) */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-background md:hidden">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-auto p-4 h-[calc(100vh-56px)]">
              <nav className="grid gap-2">
                {sidebarNav.map((item, index) => (
                  <div key={index} className="grid gap-1">
                    <Link
                      href={item.href || "#"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.title}
                    </Link>
                    {item.items && (
                      <div className="ml-4 grid gap-1 border-l pl-2">
                        {item.items.map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
