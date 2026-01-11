"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCurrentUser,
  logout,
  getSettings,
  initializeStore,
  type User,
  type Settings,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  Users,
  Ruler,
  Palette,
  Shirt,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/measurements", label: "Measurements", icon: Ruler },
  { href: "/dashboard/fabrics", label: "Fabrics", icon: Palette },
  { href: "/dashboard/alterations", label: "Alterations", icon: Scissors },
  { href: "/dashboard/jobs", label: "Job Tracking", icon: ClipboardList, adminOnly: true },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    initializeStore();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/");
      return;
    }
    setUser(currentUser);
    setSettings(getSettings());
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user.role === "admin"
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-stone-200"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>

        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-md border-r border-stone-200/50 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-stone-200/50">
              <div className="flex items-center gap-4">
                {settings?.logoUrl ? (
                  <Image
                    src={settings.logoUrl}
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain rounded-2xl shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center shadow-lg shadow-stone-900/20">
                    <Scissors className="w-8 h-8 text-stone-100" />
                  </div>
                )}
                  <div>
                    <h1 className="font-serif text-lg text-stone-900 leading-tight tracking-tight">
                      {settings?.companyName || "Bespoke"}
                    </h1>
                    <p className="text-[10px] text-stone-400 font-display tracking-[0.2em] uppercase mt-1">
                      Tailoring System
                    </p>
                  </div>

              </div>
            </div>

            <nav className="flex-1 p-6 overflow-y-auto">
              <ul className="space-y-2">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-medium transition-all duration-300 ${
                            isActive
                              ? "bg-stone-900 text-stone-50 shadow-lg shadow-stone-900/20"
                              : "text-stone-500 hover:bg-stone-100/80 hover:text-stone-900"
                          }`}
                        >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-stone-50" : "text-stone-400 group-hover:text-stone-900"}`} />
                        </motion.div>
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-stone-50"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-6 border-t border-stone-200/50 bg-stone-50/30">
              <div className="flex items-center gap-4 mb-6 px-2">
                <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                  <span className="text-lg font-serif text-stone-600">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{user.name}</p>
                  <p className="text-xs text-stone-400 capitalize tracking-wide">
                    {user.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        <main className="lg:ml-72 min-h-screen relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
          <div className="p-6 lg:p-12 relative z-10">{children}</div>
        </main>
    </div>
  );
}
