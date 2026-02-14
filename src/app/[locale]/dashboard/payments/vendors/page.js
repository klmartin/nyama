"use client";
import { useEffect, useState } from "react";
import AddPaymentModal from "@/app/components/addeditpaymentmodal";
import { useTranslations } from "next-intl";

export default function VendorPayments() {
  const [payments, setPayments] = useState([]);
  const [show, setShow] = useState(false);
 const t = useTranslations('');

  const load = async () => {
    const res = await fetch("/api/payments?type=VENDOR");
    setPayments(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">{t("vendor_payments")}</h1>
        <button
          onClick={() => setShow(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_payment")}
        </button>
      </div>

      <div className="bg-white rounded shadow text-gray-900">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("vendor")}</th>
              <th className="p-3 text-left">{t("amount")}</th>
              <th className="p-3 text-left">{t("method")}</th>
              <th className="p-3 text-left">{t("notes")}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-left">{new Date(p.payment_date).toLocaleDateString()}</td>
                <td className="p-3 text-left">{p.party_name}</td>
                <td className="p-3 text-left font-semibold">{Number(p.amount).toLocaleString()}</td>
                <td className="p-3 text-left">{p.payment_method}</td>
                <td className="p-3 text-left">{p.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <AddPaymentModal
          type="VENDOR"
          onClose={() => setShow(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
