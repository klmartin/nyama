"use client";
import { useEffect, useState } from "react";
import AddPaymentModal from "@/app/components/addeditpaymentmodal";
import { useTranslations } from "next-intl";

export default function CustomerPayments() {
  const [payments, setPayments] = useState([]);
  const [show, setShow] = useState(false);

  const load = async () => {
    const res = await fetch("/api/payments?type=CUSTOMER");
    setPayments(await res.json());
  };
 const t = useTranslations('');

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">{t("customer_payments")}</h1>
        <button
          onClick={() => setShow(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_payment")}
        </button>
      </div>

      <div className="bg-white rounded shadow text-gray-900">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("customer")}</th>
              <th className="p-3 text-left">{t("amount")}</th>
              <th className="p-3 text-left">{t("method")}</th>
              <th className="p-3 text-left">{t("notes")}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                <td className="p-3">{p.party_name}</td>
                <td className="p-3 font-semibold">{Number(p.amount).toLocaleString()}</td>
                <td className="p-3">{p.payment_method}</td>
                <td className="p-3">{p.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <AddPaymentModal
          type="CUSTOMER"
          onClose={() => setShow(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
