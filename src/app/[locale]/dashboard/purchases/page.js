"use client";
import { useEffect, useState } from "react";
import AddPurchaseModal from "@/app/components/addeditpurchasesmodel";
import { useTranslations } from "next-intl";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [show, setShow] = useState(false);
  const t = useTranslations('');

  const load = async () => {
    const res = await fetch("/api/purchases");
    const data = await res.json();
    setPurchases(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">{t("purchases")}</h1>
        <button
          onClick={() => setShow(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_purchase")}
        </button>
      </div>

      <div className="bg-white rounded shadow text-gray-900">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("vendor")}</th>
              <th className="p-3 text-left">{t("product")}</th>
              <th className="p-3 text-left">{t("quantity")}</th>
              <th className="p-3 text-left">{t("price")}</th>
              <th className="p-3 text-left">{t("total")}</th>
              <th className="p-3 text-left">{t("paid")}</th>
              <th className="p-3 text-left">{t("remaining")}</th>
              <th className="p-3 text-left">{t("status")}</th>
            </tr>
          </thead>

          {/* suppressHydrationWarning fixes the mismatch between server render (empty) and client render (with data) */}
          <tbody suppressHydrationWarning>
            {purchases.map((p) => {
              const paid = Number(p.paid_amount || 0);
              const total = Number(p.total_cost || 0);
              const remaining = total - paid;

              return (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-left text-black">
                    {new Date(p.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-left">{p.vendor_name || "—"}</td>
                  <td className="p-3 text-left">{p.product_name || "—"}</td>
                  <td className="p-3 text-left">{Number(p.quantity).toLocaleString()}</td>
                  <td className="p-3 text-left">
                    {Number(p.price_per_unit).toLocaleString()}
                  </td>
                  <td className="p-3 text-left font-semibold">
                    {total.toLocaleString()}
                  </td>
                  <td className="p-3 text-left">
                    {paid.toLocaleString()}
                  </td>
                  <td className="p-3 text-left">
                    {remaining.toLocaleString()}
                  </td>
                  <td className="p-3 text-left">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        p.payment_status === "PAID"
                          ? "bg-green-600"
                          : p.payment_status === "PARTIAL"
                          ? "bg-yellow-600"
                          : "bg-orange-500"
                      }`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {show && (
        <AddPurchaseModal
          onClose={() => setShow(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}