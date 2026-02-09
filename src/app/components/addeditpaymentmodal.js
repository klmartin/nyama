"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AddPaymentModal({ type, onClose, onSaved }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    reference_id: "",
    amount: "",
    payment_method: "CASH",
    payment_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
 const t = useTranslations('');

  useEffect(() => {
    fetch(type === "CUSTOMER" ? "/api/customers" : "/api/vendors")
      .then((r) => r.json())
      .then(setList);
  }, [type]);

  const submit = async () => {
    if (!form.reference_id || !form.amount) {
      alert("Missing fields");
      return;
    }

    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        ...form,
      }),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px] text-gray-900">
        <h2 className="text-xl font-bold mb-4">
          {t("add")} {type === "CUSTOMER" ? t("customer") : t("vendor")} {t("payment")}
        </h2>

        <select
          className="border p-2 w-full mb-3 text-black"
          onChange={(e) =>
            setForm({ ...form, reference_id: e.target.value })
          }
        >
          <option value="">{t("select")}</option>
          {list.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 w-full mb-3 text-black"
          placeholder={t("amount")}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <select
          className="border p-2 w-full mb-3 text-black"
          onChange={(e) =>
            setForm({ ...form, payment_method: e.target.value })
          }
        >
          <option value="CASH">{t("cash")}</option>
          <option value="MOBILE">{t("mobile")}</option>
          <option value="BANK">{t("bank")}</option>
        </select>

        <input
          type="text"
          className="border p-2 w-full mb-3 text-black"
          placeholder={t("notes")}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>{t("cancel")}</button>
          <button
            onClick={submit}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
