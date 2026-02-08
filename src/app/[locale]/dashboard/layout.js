"use client";
import { useState } from "react";
import Link from "next/link";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default  function DashboardLayout({ children , params }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openPayments, setOpenPayments] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  async function logout() {
    await fetch("/api/auth/logout");
    window.location.href = "/login";
  }
 const t = useTranslations('');

  return (
 
    <div className="flex h-screen bg-stone-100">

      {/* Sidebar */}
      <aside
        className={`bg-stone-900 text-white transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className="p-4 font-bold text-lg text-red-500">
          {collapsed ? "🥩" : t("meat")}
        </div>

        <nav className="mt-4 space-y-1">
          <SidebarLink href="/dashboard" label={t("dashboard")} icon="🏠" collapsed={collapsed} />
          <SidebarLink href="/dashboard/products" label={t("products")} icon="📦" collapsed={collapsed} />
          <SidebarLink href="/dashboard/customers" label={t("customers")} icon="👥" collapsed={collapsed} />
          <SidebarLink href="/dashboard/vendors" label={t("vendors")} icon="🏢" collapsed={collapsed} />
          <SidebarLink href="/dashboard/purchases" label={t("purchases")} icon="🛒" collapsed={collapsed} />
          <SidebarLink href="/dashboard/sales" label={t("sales")} icon="📈" collapsed={collapsed} />
          <SidebarLink href="/dashboard/expenses" label={t("expenses")} icon="💸" collapsed={collapsed} />

          {/* PAYMENTS PARENT */}
          <button
            onClick={() => setOpenPayments(!openPayments)}
            className="flex items-center w-full px-4 py-2 text-sm
                       hover:bg-stone-800 transition"
          >
            <span className="mr-3">💳</span>
            {!collapsed && (
              <div className="flex justify-between w-full">
                <span>{t("payments")}</span>
                <span className="text-xs">{openPayments ? "▾" : "▸"}</span>
              </div>
            )}
          </button>

          {/* PAYMENTS SUB NAV */}
          {openPayments && !collapsed && (
            <div className="ml-8 space-y-1 text-sm">
              <SidebarSubLink
                href="/dashboard/payments/customers"
                label={t("customer_payments")}
              />
              <SidebarSubLink
                href="/dashboard/payments/vendors"
                label={t("vendor_payments")}
              />
            </div>
          )}
          <button
            onClick={() => setOpenReports(!openReports)}
            className="flex items-center w-full px-4 py-2 text-sm
                       hover:bg-stone-800 transition"
          >
            <span className="mr-3">📊</span>
            {!collapsed && (
              <div className="flex justify-between w-full">
                <span>{t("reports")}</span>
                <span className="text-xs">{openReports ? "▾" : "▸"}</span>
              </div>
            )}
          </button>

          {/* REPORTS SUB NAV */}
          {openReports && !collapsed && (
            <div className="ml-8 space-y-1 text-sm">
              <SidebarSubLink
                href="/dashboard/reports/sales"
                label="📈 Sales"
              />
              <SidebarSubLink
                href="/dashboard/reports/purchases"
                label="🛒 Purchases"
              />
              <SidebarSubLink
                href="/dashboard/reports/profits"
                label="💰 Profits"
              />
              <SidebarSubLink
                href="/dashboard/reports/payments"
                label="💳 Payments"
              />
              <SidebarSubLink
                href="/dashboard/reports/expenses"
                label="💸 Expenses"
              />
            </div>
          )}
          <SidebarLink href="/dashboard/users" label={t("users")} icon="👤" collapsed={collapsed} />
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-red-800"
          >
            ☰
          </button>
          <LanguageSwitcher />
          <button
            onClick={logout}
            className="bg-red-800 text-white px-4 py-1.5 rounded-lg
                       hover:bg-red-700 transition"
          >
            {t("logout")}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>


  );
}

/* MAIN LINK */
function SidebarLink({ 
  href, 
  label, 
  collapsed, 
  icon = "📊",  // Default emoji if none provided
  iconComponent: IconComponent = null  // For Lucide/React icons
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-sm
                 hover:bg-stone-800 transition rounded"
    >
      <span className="mr-3 flex items-center justify-center w-5">
        {IconComponent ? (
          <IconComponent size={18} />
        ) : (
           icon
        )}
      </span>
      {!collapsed && label}
    </Link>
  );
}

/* SUB LINK */
function SidebarSubLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block px-4 py-1.5 rounded
                 hover:bg-stone-800 transition"
    >
      {label}
    </Link>
  );
}
