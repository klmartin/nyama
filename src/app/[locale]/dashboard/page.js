"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { DollarSign, Users, AlertCircle, Boxes } from "lucide-react";
import StatCard from "@/app/components/statcard";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});

  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(setStats);
    fetch("/api/dashboard/charts").then(r => r.json()).then(setCharts);
  }, []);
 const t = useTranslations('');
 
  return (
       

    <div className="space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title={t("total_payments")} value={stats.totalPayments} icon={<DollarSign />} />
        <StatCard title={t("customers")} value={stats.totalCustomers} icon={<Users />} />
        <StatCard title={t("unpaid_balances")} value={stats.unpaidBalances} icon={<AlertCircle />} />
        <StatCard title={t("total_stock")} value={stats.totalStock} icon={<Boxes />} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard title={t("total_revenue")}>
          <LineChart data={charts.revenue}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title={t("units_sold")}>
          <BarChart data={charts.units}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" />
          </BarChart>
        </ChartCard>

        <ChartCard title={t("total_purchases")}>
          <LineChart data={charts.purchases}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title={t("sales_vs_inventory")}>
          <LineChart data={charts.inventory}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" strokeWidth={2} />
          </LineChart>
        </ChartCard>

      </div>
    </div>
   
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-black font-semibold mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
