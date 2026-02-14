"use client";
import { useEffect, useState } from "react";
import AddSaleModal from "@/app/components/addeditsalemodal";
import { useTranslations } from "next-intl";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [show, setShow] = useState(false);
 const t = useTranslations('');

  const load = async () => {
    const res = await fetch("/api/sales");
    console.log(res);
    console.log('this is res ')
    setSales(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("sales")}</h1>
        <button
          onClick={() => setShow(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_sale")}
        </button>
      </div>

      <div className="bg-white rounded shadow text-gray-900">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("customer")}</th>
              <th className="p-3 text-left">{t("product")}</th>
              <th className="p-3 text-left">{t("quantity")}</th>
              <th className="p-3 text-left">{t("price")}</th>
              <th className="p-3 text-left">{t("total")}</th>
              <th className="p-3 text-left">{t("payment_status")}</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-left">{new Date(s.sale_date).toLocaleDateString()}</td>
                <td className="p-3 text-left">{s.customer}</td>
                <td className="p-3 text-left">{s.product}</td>
                <td className="p-3 text-left">{s.quantity}</td>
                <td className="p-3 text-left">{Number(s.price_per_unit).toLocaleString() }</td>
                <td className="p-3 text-left font-semibold">
                  {Number(s.total_amount).toLocaleString()}
                </td>
                <td className="p-3 text-left">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      s.payment_status === "PAID"
                        ? "bg-green-600"
                        : "bg-orange-500"
                    }`}
                  >
                    {s.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <AddSaleModal
          onClose={() => setShow(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
