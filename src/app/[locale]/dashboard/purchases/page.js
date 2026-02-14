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
    setPurchases(await res.json());
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
              <th className="p-3 text-left">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-left text-black">
  {new Date(p.purchase_date).toLocaleDateString()}
</td>
                <td className="p-3 text-left">{p.vendor}</td>
                <td className="p-3 text-left">{p.product}</td>
                <td className="p-3 text-left">{p.quantity}</td>
                <td className="p-3 text-left">{p.price_per_unit}</td>
                <td className="p-3 text-left font-semibold">
                  {p.total_cost}
                </td>
                <td className="p-3 text-left">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      p.payment_status === "PAID"
                        ? "bg-green-600"
                        : "bg-orange-500"
                    }`}
                  >
                    {p.payment_status}
                  </span>
                </td>
              </tr>
            ))}
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
